import io
import os
from django.conf import settings
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from .models import SessionNote

def generate_case_history_pdf(client, case_history):
    """
    Generates a formal, Mindlap-branded clinical PDF evaluation report for a client.
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
    
    # Mindlap Brand Color Palette
    PURPLE_PRIMARY = colors.HexColor('#9333EA')
    PURPLE_DARK = colors.HexColor('#7E22CE')
    PURPLE_LIGHT = colors.HexColor('#F3E8FF')
    SLATE_900 = colors.HexColor('#0F172A')
    SLATE_700 = colors.HexColor('#334155')
    SLATE_100 = colors.HexColor('#F1F5F9')
    SLATE_200 = colors.HexColor('#E2E8F0')
    BORDER_COLOR = colors.HexColor('#CBD5E1')

    # Typography Styles
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=PURPLE_PRIMARY,
        alignment=0, # Left align
        spaceAfter=2
    )
    
    subtitle_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=PURPLE_DARK,
        alignment=0,
        spaceAfter=4
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=SLATE_900
    )

    section_head = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=PURPLE_DARK,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=SLATE_900
    )

    elements = []

    # 1. Header Banner with Mindlap Logo Image
    logo_path = os.path.join(settings.BASE_DIR, 'logo.png')
    header_data = []
    
    if os.path.exists(logo_path):
        # 632 x 194 aspect ratio -> width=150, height=46
        logo_img = Image(logo_path, width=150, height=46)
        text_block = [
            Paragraph("MINDLAP THERAPY CLINIC", title_style),
            Paragraph("CONFIDENTIAL CLINICAL CASE EVALUATION REPORT", subtitle_style),
            Paragraph("<font size=7.5 color='#64748B'>Mental Health Management System & Client Record</font>", body_style)
        ]
        header_data = [[logo_img, text_block]]
    else:
        text_block = [
            Paragraph("MINDLAP THERAPY CLINIC", title_style),
            Paragraph("CONFIDENTIAL CLINICAL CASE EVALUATION REPORT", subtitle_style)
        ]
        header_data = [[text_block]]

    t_header = Table(header_data, colWidths=[160, 380] if len(header_data[0]) > 1 else [540])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=PURPLE_PRIMARY, spaceAfter=12))

    # 2. Client & Evaluation Metadata Card
    eval_by = "Unassigned"
    updated_date = "N/A"
    if case_history and case_history.psychologist and case_history.psychologist.user:
        eval_by = f"Dr. {case_history.psychologist.user.name}"
    elif client.assigned_psychologist and client.assigned_psychologist.user:
        eval_by = f"Dr. {client.assigned_psychologist.user.name}"

    if case_history and case_history.updated_at:
        updated_date = case_history.updated_at.strftime('%B %d, %Y')

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
            Paragraph(f"<b>Phone:</b> {client.phone or 'N/A'}", body_style),
            Paragraph(f"<b>Email:</b> {client.email or 'N/A'}", body_style)
        ],
        [
            Paragraph(f"<b>Assigned Therapist:</b> {eval_by}", body_style),
            Paragraph(f"<b>Report Date:</b> {updated_date}", body_style)
        ]
    ]

    t_meta = Table(meta_data, colWidths=[270, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_100),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_200),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 10))

    if not case_history:
        no_ch_data = [[
            Paragraph("<b>Notice: No Case History Recorded</b><br/><font color='#78350F'>A clinical case history evaluation report has not been created or recorded for this client yet.</font>", body_style)
        ]]
        t_no_ch = Table(no_ch_data, colWidths=[540])
        t_no_ch.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#FDE68A')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_no_ch)
        elements.append(Spacer(1, 10))
    else:
        # Section 1: Presenting Problems & HPI
        elements.append(Paragraph("1. Presenting Problems & History of Present Illness", section_head))
        elements.append(Paragraph(f"<b>Presenting Problems:</b><br/>{case_history.presenting_problems or 'No active presenting problems recorded'}", body_style))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(f"<b>History of Present Illness (HPI):</b><br/>{case_history.history_of_present_illness or 'Not recorded'}", body_style))
        elements.append(Spacer(1, 10))

        # Section 2: Medical & Psychiatric Background
        elements.append(Paragraph("2. Medical & Psychiatric Background", section_head))
        elements.append(Paragraph(f"<b>Medical History:</b> {case_history.medical_history or 'Not recorded'}", body_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"<b>Psychiatric History:</b> {case_history.psychiatric_history or 'Not recorded'}", body_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"<b>Substance Use:</b> {case_history.substance_use or 'Not recorded'}", body_style))
        elements.append(Spacer(1, 10))

        # Section 3: MSE Exam Table
        elements.append(Paragraph("3. Mental Status Examination (MSE)", section_head))
        mse = case_history.mental_status_examination or {}
        mse_table_data = [
            [
                Paragraph(f"<b>Appearance:</b> {mse.get('appearance', 'Not assessed')}", body_style),
                Paragraph(f"<b>Behavior:</b> {mse.get('behavior', 'Not assessed')}", body_style)
            ],
            [
                Paragraph(f"<b>Speech:</b> {mse.get('speech', 'Not assessed')}", body_style),
                Paragraph(f"<b>Mood / Affect:</b> {mse.get('moodAndAffect', 'Not assessed')}", body_style)
            ],
            [
                Paragraph(f"<b>Thought Process:</b> {mse.get('thoughtProcess', 'Not assessed')}", body_style),
                Paragraph(f"<b>Insight & Judgment:</b> {mse.get('insightAndJudgment', 'Not assessed')}", body_style)
            ]
        ]
        t_mse = Table(mse_table_data, colWidths=[270, 270])
        t_mse.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FAF5FF')), # Light purple tint
            ('PADDING', (0,0), (-1,-1), 6),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E9D5FF')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F3E8FF')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_mse)
        elements.append(Spacer(1, 10))

        # Section 4: Risk Assessment & Clinical Diagnosis
        elements.append(Paragraph("4. Clinical Risk Assessment & Primary Diagnosis", section_head))
        risk = case_history.risk_assessment or {}
        diag = case_history.diagnosis or {}
        
        risk_level = risk.get('suicideRisk', 'Not Assessed')
        diag_data = [
            [
                Paragraph(f"<b>Suicide Risk:</b> <font color='{'#DC2626' if risk_level=='High' else '#D97706' if risk_level=='Moderate' else '#059669' if risk_level=='Low' else '#64748B'}'><b>{risk_level}</b></font>", body_style),
                Paragraph(f"<b>Self-Harm Risk:</b> {risk.get('selfHarmRisk', 'Not Assessed')}", body_style)
            ],
            [
                Paragraph(f"<b>Primary Diagnosis:</b> {diag.get('primaryDiagnosis', 'Pending Assessment')}", body_style),
                Paragraph(f"<b>Secondary Diagnosis:</b> {diag.get('secondaryDiagnosis', 'None')}", body_style)
            ]
        ]
        t_diag = Table(diag_data, colWidths=[270, 270])
        t_diag.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), SLATE_100),
            ('PADDING', (0,0), (-1,-1), 6),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_diag)
        if risk.get('riskNotes'):
            elements.append(Spacer(1, 4))
            elements.append(Paragraph(f"<b>Risk Notes & Rationales:</b> {risk.get('riskNotes')}", body_style))
        elements.append(Spacer(1, 10))

        # Section 5: Treatment Plan & Goals
        elements.append(Paragraph("5. Recommended Treatment Plan & Goals", section_head))
        tp = case_history.treatment_plan or {}
        elements.append(Paragraph(f"<b>Short-Term Goals:</b> {tp.get('shortTermGoals', 'Not specified')}", body_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"<b>Long-Term Goals:</b> {tp.get('longTermGoals', 'Not specified')}", body_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"<b>Therapeutic Modality:</b> {tp.get('modality', 'Not specified')}", body_style))
        elements.append(Spacer(1, 10))

        # Section 6: Session Notes Timeline (if any exist)
        sessions = SessionNote.objects.filter(client=client).order_by('session_number')
        if sessions.exists():
            elements.append(Paragraph("6. Therapy Session Progress Timeline", section_head))
            sn_headers = [
                Paragraph("<b>Sess #</b>", meta_label),
                Paragraph("<b>Date</b>", meta_label),
                Paragraph("<b>Duration</b>", meta_label),
                Paragraph("<b>Clinical Progress & Notes</b>", meta_label)
            ]
            sn_table_data = [sn_headers]
            for sn in sessions:
                sn_table_data.append([
                    Paragraph(f"#{sn.session_number}", body_style),
                    Paragraph(sn.session_date.strftime('%Y-%m-%d'), body_style),
                    Paragraph(sn.duration or '50m', body_style),
                    Paragraph(f"<b>Notes:</b> {sn.notes or 'N/A'}<br/><b>Homework:</b> {sn.homework or 'N/A'}", body_style)
                ])
            
            t_sn = Table(sn_table_data, colWidths=[45, 75, 60, 360])
            t_sn.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), PURPLE_LIGHT),
                ('TEXTCOLOR', (0,0), (-1,0), PURPLE_DARK),
                ('PADDING', (0,0), (-1,-1), 5),
                ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            elements.append(t_sn)
            elements.append(Spacer(1, 15))

    # 7. Clinician Signature Block
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=12))
    
    sig_name = eval_by
    sig_data = [
        [
            Paragraph(f"<b>Clinician Signature:</b> ________________________", body_style),
            Paragraph("<b>Date:</b> ____________________", body_style)
        ],
        [
            Paragraph(f"<font color='#64748B' size=8>{sig_name}</font>", body_style),
            Paragraph("<font color='#64748B' size=8>Official Mindlap Clinical Record</font>", body_style)
        ]
    ]
    t_sig = Table(sig_data, colWidths=[320, 220])
    t_sig.setStyle(TableStyle([
        ('PADDING', (0,0), (-1,-1), 2),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(KeepTogether(t_sig))

    doc.build(elements)
    buffer.seek(0)
    
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Case_History_{client.client_code}.pdf"'
    return response
