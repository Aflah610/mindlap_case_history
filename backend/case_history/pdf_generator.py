import io
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_case_history_pdf(client, case_history):
    """
    Generates a formal clinical PDF evaluation report for a Mindlap client.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette Styles (Mindlap Purple & Slate Brand Theme)
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#9333EA'),
        alignment=1, # Center
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#8B5CF6'),
        alignment=1,
        spaceAfter=15
    )

    section_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )

    elements = []

    # Clinic Brand Header
    elements.append(Paragraph("MINDLAP THERAPY CLINIC", title_style))
    elements.append(Paragraph("CONFIDENTIAL CLINICAL CASE EVALUATION REPORT", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#9333EA'), spaceAfter=15))

    # Patient & Case Meta Data Table
    meta_data = [
        [
            Paragraph(f"<b>Client Name:</b> {client.full_name}", body_style),
            Paragraph(f"<b>Client ID:</b> {client.client_code}", body_style)
        ],
        [
            Paragraph(f"<b>Age / Gender:</b> {client.age} yrs ({client.gender})", body_style),
            Paragraph(f"<b>Date of Birth:</b> {client.dob or 'N/A'}", body_style)
        ],
        [
            Paragraph(f"<b>Evaluated By:</b> {case_history.psychologist.user.name if case_history and case_history.psychologist else 'N/A'}", body_style),
            Paragraph(f"<b>Report Date:</b> {case_history.updated_at.strftime('%Y-%m-%d') if case_history else 'N/A'}", body_style)
        ]
    ]

    t_meta = Table(meta_data, colWidths=[270, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 15))

    if case_history:
        # Section 1: Presenting Problems
        elements.append(Paragraph("1. Presenting Problems & History of Present Illness", section_style))
        elements.append(Paragraph(f"<b>Presenting Problems:</b> {case_history.presenting_problems or 'None recorded'}", body_style))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(f"<b>History of Present Illness (HPI):</b> {case_history.history_of_present_illness or 'None recorded'}", body_style))
        elements.append(Spacer(1, 12))

        # Section 2: Medical & Psychiatric Background
        elements.append(Paragraph("2. Medical & Psychiatric Background", section_style))
        elements.append(Paragraph(f"<b>Medical History:</b> {case_history.medical_history or 'Unremarkable'}", body_style))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(f"<b>Psychiatric History:</b> {case_history.psychiatric_history or 'Unremarkable'}", body_style))
        elements.append(Spacer(1, 12))

        # Section 3: MSE Exam Summary
        elements.append(Paragraph("3. Mental Status Examination (MSE)", section_style))
        mse = case_history.mental_status_examination or {}
        mse_text = (
            f"<b>Appearance:</b> {mse.get('appearance', 'N/A')}<br/>"
            f"<b>Behavior:</b> {mse.get('behavior', 'N/A')}<br/>"
            f"<b>Speech:</b> {mse.get('speech', 'N/A')}<br/>"
            f"<b>Mood/Affect:</b> {mse.get('moodAndAffect', 'N/A')}<br/>"
            f"<b>Thought Process:</b> {mse.get('thoughtProcess', 'N/A')}<br/>"
            f"<b>Insight & Judgment:</b> {mse.get('insightAndJudgment', 'N/A')}"
        )
        elements.append(Paragraph(mse_text, body_style))
        elements.append(Spacer(1, 12))

        # Section 4: Risk Assessment & Clinical Diagnosis
        elements.append(Paragraph("4. Clinical Risk Assessment & Primary Diagnosis", section_style))
        risk = case_history.risk_assessment or {}
        diag = case_history.diagnosis or {}
        
        diag_text = (
            f"<b>Suicide Risk:</b> {risk.get('suicideRisk', 'Low')} | "
            f"<b>Self-Harm Risk:</b> {risk.get('selfHarmRisk', 'Low')}<br/>"
            f"<b>Primary Diagnosis:</b> {diag.get('primaryDiagnosis', 'F41.1 - Generalized Anxiety Disorder')}<br/>"
            f"<b>Risk Notes:</b> {risk.get('riskNotes', 'No active suicidal ideation expressed.')}"
        )
        elements.append(Paragraph(diag_text, body_style))
        elements.append(Spacer(1, 12))

        # Section 5: Treatment Plan
        elements.append(Paragraph("5. Recommended Treatment Plan & Goals", section_style))
        tp = case_history.treatment_plan or {}
        tp_text = (
            f"<b>Short-Term Goals:</b> {tp.get('shortTermGoals', 'N/A')}<br/>"
            f"<b>Long-Term Goals:</b> {tp.get('longTermGoals', 'N/A')}<br/>"
            f"<b>Modality:</b> {tp.get('modality', 'Cognitive Behavioral Therapy (CBT)')}"
        )
        elements.append(Paragraph(tp_text, body_style))
        elements.append(Spacer(1, 20))
    
    # Signature Block
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94a3b8'), spaceAfter=15))
    sig_data = [
        [
            Paragraph("<b>Clinical Psychologist Signature:</b> ___________________", body_style),
            Paragraph("<b>Date Signed:</b> ___________________", body_style)
        ]
    ]
    t_sig = Table(sig_data, colWidths=[300, 240])
    elements.append(t_sig)

    doc.build(elements)
    buffer.seek(0)
    
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Case_History_{client.client_code}.pdf"'
    return response
