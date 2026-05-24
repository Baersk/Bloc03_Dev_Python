from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Application, User, Vehicle

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

@applications_bp.route("", methods=["POST"])
@jwt_required()
def create_application():
    """Créer une nouvelle demande (achat/location)"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        print(f"=== POST /api/applications ===")
        print(f"User ID: {user_id}")
        print(f"Payload reçu: {data}")

        if not data:
            return jsonify({"error": "Corps de la requête vide"}), 400

        if not data.get("vehicle_id") or not data.get("service_type"):
            return jsonify({"error": "Données manquantes: vehicle_id et service_type requis"}), 400

        vehicle = Vehicle.query.get(data["vehicle_id"])
        if not vehicle:
            return jsonify({"error": "Véhicule non trouvé"}), 404

        from datetime import datetime

        # Parser les dates si présentes
        start_date = None
        end_date = None
        driving_license_expiry = None

        if data.get("start_date"):
            try:
                start_date = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
            except (ValueError, TypeError) as e:
                return jsonify({"error": f"Format date invalide pour start_date: {str(e)}"}), 400

        if data.get("end_date"):
            try:
                end_date = datetime.strptime(data["end_date"], "%Y-%m-%d").date()
            except (ValueError, TypeError) as e:
                return jsonify({"error": f"Format date invalide pour end_date: {str(e)}"}), 400

        if data.get("driving_license_expiry"):
            try:
                driving_license_expiry = datetime.strptime(data["driving_license_expiry"], "%Y-%m-%d").date()
            except (ValueError, TypeError) as e:
                return jsonify({"error": f"Format date invalide pour driving_license_expiry: {str(e)}"}), 400

        application = Application(
            user_id=user_id,
            vehicle_id=data["vehicle_id"],
            service_type=data["service_type"],
            driving_license_number=data.get("driving_license_number"),
            driving_license_expiry=driving_license_expiry,
            notes=data.get("notes"),
            package_included=data.get("package_included", False),
            package_price_monthly=data.get("package_price_monthly", 0),
            start_date=start_date,
            end_date=end_date,
            # Paiements
            deposit_amount=data.get("deposit_amount", 500),
            total_amount=data.get("total_amount", 0),
            payment_method=data.get("payment_method", "credit"),
            payment_status=data.get("payment_status", "pending"),
            # Leasing & Option d'achat
            option_achat_active=data.get("option_achat_active", False),
            valeur_residuelle=data.get("valeur_residuelle", 0),
        )

        db.session.add(application)
        db.session.commit()

        return jsonify({
            "message": "Demande créée avec succès",
            "application": application.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Erreur create_application: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500

@applications_bp.route("/my-applications", methods=["GET"])
@jwt_required()
def get_my_applications():
    """Récupérer mes demandes (client connecté)"""
    try:
        user_id = int(get_jwt_identity())
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        paginated = Application.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page
        )
        
        return jsonify({
            "applications": [a.to_dict() for a in paginated.items],
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>", methods=["GET"])
@jwt_required()
def get_application(application_id):
    """Récupérer les détails d'une demande"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404
        
        # Vérifier les droits (propriétaire ou admin)
        if application.user_id != user_id and not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        return jsonify(application.to_dict()), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>", methods=["PUT"])
@jwt_required()
def update_application(application_id):
    """Mettre à jour une demande"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404
        
        # Vérifier les droits
        if application.user_id != user_id and not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        data = request.get_json()
        
        # Clients: peuvent modifier certains champs
        if not user.is_admin:
            allowed_fields = ["driving_license_number", "driving_license_expiry", "notes"]
        else:
            # Admins: peuvent modifier plus de champs
            allowed_fields = [
                "status", "admin_notes", "driving_license_number",
                "driving_license_expiry", "notes", "package_included", "package_price_monthly"
            ]
        
        for field in allowed_fields:
            if field in data:
                setattr(application, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            "message": "Demande mise à jour",
            "application": application.to_dict(),
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@applications_bp.route("", methods=["GET"])
@jwt_required()
def get_all_applications():
    """Récupérer toutes les demandes (admin seulement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        status = request.args.get("status")
        service_type = request.args.get("service_type")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        query = Application.query
        
        if status:
            query = query.filter_by(status=status)
        
        if service_type:
            query = query.filter_by(service_type=service_type)
        
        paginated = query.paginate(page=page, per_page=per_page)
        
        return jsonify({
            "applications": [a.to_dict() for a in paginated.items],
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/approve", methods=["POST"])
@jwt_required()
def approve_application(application_id):
    """Approuver une demande (admin seulement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404
        
        data = request.get_json() or {}
        
        # Approuver et mettre à jour le véhicule
        application.approve()
        application.admin_notes = data.get("admin_notes")
        db.session.commit()
        
        return jsonify({
            "message": "Demande approuvée",
            "application": application.to_dict(),
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/reject", methods=["POST"])
@jwt_required()
def reject_application(application_id):
    """Rejeter une demande (admin seulement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404
        
        data = request.get_json() or {}
        
        application.reject()
        application.admin_notes = data.get("admin_notes")
        db.session.commit()
        
        return jsonify({
            "message": "Demande rejetée",
            "application": application.to_dict(),
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/upload-document", methods=["POST"])
@jwt_required()
def upload_document(application_id):
    """Uploader un document pour une demande"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        application = Application.query.get(application_id)
        
        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404
        
        # Vérifier les droits
        if application.user_id != user_id and not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        if "file" not in request.files:
            return jsonify({"error": "Aucun fichier fourni"}), 400
        
        file = request.files["file"]
        doc_type = request.form.get("document_type")
        
        valid_types = [
            "identity_document", "license_document",
            "insurance_document", "proof_of_residence"
        ]
        
        if not doc_type or doc_type not in valid_types:
            return jsonify({"error": "Type de document invalide"}), 400
        
        # En production: uploader sur S3/storage
        # Pour maintenant: stocker le chemin
        filename = f"uploads/{application_id}_{doc_type}_{file.filename}"
        
        setattr(application, doc_type, filename)
        db.session.commit()
        
        return jsonify({
            "message": "Document uploadé",
            "application": application.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/mark-paid", methods=["POST"])
@jwt_required()
def mark_payment_paid(application_id):
    """Marquer le paiement comme reçu (admin uniquement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403

        application = Application.query.get(application_id)

        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404

        from datetime import datetime
        application.payment_status = "paid"
        application.paid_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Paiement marqué comme reçu",
            "application": application.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/client-pay-balance", methods=["POST"])
@jwt_required()
def client_pay_balance(application_id):
    """Client simule le paiement du solde (après approbation admin)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        application = Application.query.get(application_id)

        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404

        # Vérifier que c'est le propriétaire de la demande
        if application.user_id != user_id:
            return jsonify({"error": "Accès non autorisé"}), 403

        # Vérifier que le dossier est accepté
        if application.status != "accepte":
            return jsonify({"error": "Le dossier doit être accepté pour payer le solde"}), 400

        from datetime import datetime
        application.payment_status = "paid"
        application.paid_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Solde payé avec succès",
            "application": application.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/download-invoice", methods=["GET"])
@jwt_required()
def download_invoice(application_id):
    """Télécharger la facture PDF d'une demande"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        application = Application.query.get(application_id)

        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404

        # Vérifier les droits (propriétaire ou admin)
        if application.user_id != user_id and not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403

        if not application.invoice_number:
            return jsonify({"error": "Facture non disponible"}), 404

        # Générer le PDF
        from io import BytesIO
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors

            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()

            # En-tête
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=30,
            )
            elements.append(Paragraph("FACTURE", title_style))

            # Infos facture
            invoice_style = ParagraphStyle(
                'Info',
                parent=styles['Normal'],
                fontSize=10,
            )
            elements.append(Paragraph(f"Numéro: <b>{application.invoice_number}</b>", invoice_style))
            from datetime import datetime
            elements.append(Paragraph(f"Date: <b>{datetime.utcnow().strftime('%d/%m/%Y')}</b>", invoice_style))
            elements.append(Spacer(1, 0.5*inch))

            # Détails du dossier
            heading_style = ParagraphStyle(
                'Heading',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=10,
            )
            elements.append(Paragraph("DÉTAILS DU DOSSIER", heading_style))

            details_data = [
                ["Véhicule", f"{application.vehicle.brand} {application.vehicle.model} ({application.vehicle.year})"],
                ["Service", "Location court terme" if application.service_type == "location_court_terme" else "Location longue durée" if application.service_type == "location_longue_duree" else "Achat"],
                ["Client", f"{application.user.firstname} {application.user.lastname}"],
            ]

            details_table = Table(details_data, colWidths=[2*inch, 4*inch])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f9ff')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(details_table)
            elements.append(Spacer(1, 0.5*inch))

            # Récapitulatif financier
            elements.append(Paragraph("RÉCAPITULATIF FINANCIER", heading_style))

            financial_data = [
                ["Description", "Montant"],
                ["Prix total du service", f"{application.total_amount:.2f} €"],
                ["Acompte versé", f"{application.deposit_amount:.2f} €"],
                ["Solde payé", f"{application.total_amount - application.deposit_amount:.2f} €"],
                ["TOTAL PAYÉ", f"<b>{application.total_amount:.2f} €</b>"],
            ]

            financial_table = Table(financial_data, colWidths=[3*inch, 2*inch])
            financial_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f0f9ff')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ]))
            elements.append(financial_table)
            elements.append(Spacer(1, 0.5*inch))

            # Conditions
            conditions_style = ParagraphStyle(
                'Conditions',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
            )
            elements.append(Paragraph("Cette facture est générée automatiquement. Merci de votre confiance.", conditions_style))

            doc.build(elements)
            buffer.seek(0)

            from flask import send_file
            return send_file(
                buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"facture_{application.invoice_number}.pdf"
            )

        except ImportError:
            # Si reportlab n'est pas installé, retourner une erreur
            return jsonify({"error": "Génération PDF non disponible. Contactez l'administrateur."}), 500

    except Exception as e:
        import traceback
        print(f"Erreur download_invoice: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/confirm-payment", methods=["POST"])
@jwt_required()
def confirm_payment(application_id):
    """Confirmer le paiement et générer la facture (admin) + Automatiser le statut véhicule"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403

        application = Application.query.get(application_id)

        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404

        from datetime import datetime
        from uuid import uuid4

        # Générer le numéro de facture
        application.invoice_number = f"INV-{application.id}-{uuid4().hex[:8].upper()}"
        application.payment_status = "confirmed"
        application.confirmed_at = datetime.utcnow()
        application.status = "complete"

        # 🔑 AUTOMATISATION DU STATUT VÉHICULE (Règles de leasing)
        # Règle 1: Achat direct → véhicule "vendu"
        if application.service_type == "achat":
            application.vehicle.mark_as_sold()
        # Règle 2: Location LLD avec option d'achat → véhicule "loue" (en attente de levée d'option)
        elif application.service_type == "location_longue_duree" and application.option_achat_active:
            application.vehicle.mark_as_rented()
        # Règle 3: Location LLD sans option → véhicule "loue" (normal)
        elif application.service_type == "location_longue_duree":
            application.vehicle.mark_as_rented()
        # Règle 4: Location courte durée → véhicule "loue"
        elif application.service_type == "location_court_terme":
            application.vehicle.mark_as_rented()

        db.session.commit()

        return jsonify({
            "message": "Paiement confirmé et facture générée - Statut véhicule mis à jour automatiquement",
            "application": application.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Erreur confirm_payment: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@applications_bp.route("/<int:application_id>/lever-option-achat", methods=["POST"])
@jwt_required()
def lever_option_achat(application_id):
    """Client lève l'option d'achat en fin de contrat de leasing"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        application = Application.query.get(application_id)

        if not application:
            return jsonify({"error": "Demande non trouvée"}), 404

        # Vérifier que c'est le propriétaire du dossier
        if application.user_id != user_id:
            return jsonify({"error": "Accès non autorisé"}), 403

        # Vérifier que c'est un dossier LLD avec option d'achat active
        if application.service_type != "location_longue_duree" or not application.option_achat_active:
            return jsonify({"error": "Aucune option d'achat disponible"}), 400

        # Vérifier que le dossier est complété et l'option n'a pas déjà été levée
        if application.status != "complete" or application.option_achat_levee:
            return jsonify({"error": "Impossible de lever l'option d'achat"}), 400

        from datetime import datetime

        # Marquer l'option comme levée
        application.option_achat_levee = True
        application.date_levee_option = datetime.utcnow()

        # Changer le statut du véhicule à "vendu"
        application.vehicle.mark_as_sold()

        # Créer facture de rachat (optionnel - on peut aussi laisser pour admin)
        from uuid import uuid4
        application.invoice_number = f"INV-RACHAT-{application.id}-{uuid4().hex[:8].upper()}"

        db.session.commit()

        return jsonify({
            "message": "Option d'achat levée avec succès - Le véhicule est maintenant vôtre",
            "application": application.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Erreur lever_option_achat: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500