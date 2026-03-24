"""
PDF Report Generation Module
Generates comprehensive assessment reports in PDF format
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Image, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from datetime import datetime
import os
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt
from models import db, Student, AssessmentSession, RiskScore, Explanation, Recommendation


class ReportGenerator:
    """Generate comprehensive PDF assessment reports"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section heading
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        ))
        
        # Risk level style
        self.styles.add(ParagraphStyle(
            name='RiskLevel',
            parent=self.styles['Normal'],
            fontSize=14,
            fontName='Helvetica-Bold',
            spaceAfter=6
        ))
    
    def _create_risk_chart(self, risk_scores):
        """Create a bar chart of risk scores"""
        disabilities = []
        scores = []
        colors_list = []
        
        for score in risk_scores:
            disabilities.append(score.disability_category.title())
            scores.append(score.final_score * 100)
            
            # Color based on risk level
            if score.risk_level == 'low':
                colors_list.append('#10b981')  # Green
            elif score.risk_level == 'moderate':
                colors_list.append('#f59e0b')  # Yellow
            else:
                colors_list.append('#ef4444')  # Red
        
        # Create figure
        fig, ax = plt.subplots(figsize=(8, 5))
        bars = ax.barh(disabilities, scores, color=colors_list)
        
        # Customize chart
        ax.set_xlabel('Risk Score (%)', fontsize=12, fontweight='bold')
        ax.set_title('Learning Disability Risk Assessment', fontsize=14, fontweight='bold')
        ax.set_xlim(0, 100)
        
        # Add value labels
        for i, (bar, score) in enumerate(zip(bars, scores)):
            ax.text(score + 2, i, f'{score:.1f}%', 
                   va='center', fontsize=10, fontweight='bold')
        
        # Add grid
        ax.grid(axis='x', alpha=0.3, linestyle='--')
        ax.set_axisbelow(True)
        
        # Save to BytesIO
        img_buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
        plt.close()
        img_buffer.seek(0)
        
        return img_buffer
    
    def _get_risk_color(self, risk_level):
        """Get color for risk level"""
        colors_map = {
            'low': colors.HexColor('#10b981'),
            'moderate': colors.HexColor('#f59e0b'),
            'high': colors.HexColor('#ef4444')
        }
        return colors_map.get(risk_level, colors.grey)
    
    def generate_report(self, session_id, output_path=None):
        """
        Generate a comprehensive PDF report for an assessment session
        
        Args:
            session_id: ID of the assessment session
            output_path: Optional path to save PDF (default: reports/)
            
        Returns:
            Path to generated PDF file
        """
        # Fetch data
        session = AssessmentSession.query.get(session_id)
        if not session:
            raise ValueError(f"Assessment session {session_id} not found")
        
        student = Student.query.get(session.student_id)
        risk_scores = RiskScore.query.filter_by(session_id=session_id).all()
        explanations = Explanation.query.filter_by(session_id=session_id).all()
        recommendations = Recommendation.query.filter_by(session_id=session_id).all()
        
        # Set up output path
        if not output_path:
            reports_dir = 'reports'
            os.makedirs(reports_dir, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = os.path.join(
                reports_dir, 
                f"assessment_report_{student.student_id}_{timestamp}.pdf"
            )
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Build document content
        story = []
        
        # Header
        story.append(Paragraph(
            "Learning Disability Screening Report",
            self.styles['CustomTitle']
        ))
        story.append(Spacer(1, 0.2*inch))
        
        # Report metadata
        report_info = [
            ['Report Date:', datetime.now().strftime('%B %d, %Y')],
            ['Assessment Date:', session.created_at.strftime('%B %d, %Y')],
            ['Report Type:', 'Educational Screening Assessment']
        ]
        
        info_table = Table(report_info, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4b5563')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Student Information Section
        story.append(Paragraph("Student Information", self.styles['SectionHeading']))

        student_dob = student.date_of_birth.strftime('%B %d, %Y') if student.date_of_birth else 'N/A'
        student_age = student.age if hasattr(student, 'age') else None
        student_gender = student.gender.title() if student.gender else 'Not specified'
        
        student_data = [
            ['Student ID:', student.student_id],
            ['Name:', f"{student.first_name} {student.last_name}"],
            ['Date of Birth:', student_dob],
            ['Age:', str(student_age) if student_age is not None else 'N/A'],
            ['Grade:', str(student.grade)],
            ['Gender:', student_gender]
        ]
        
        student_table = Table(student_data, colWidths=[2*inch, 4*inch])
        student_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(student_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Risk Assessment Chart
        story.append(Paragraph("Risk Assessment Summary", self.styles['SectionHeading']))
        
        # Generate and add chart
        if risk_scores:
            chart_buffer = self._create_risk_chart(risk_scores)
            img = Image(chart_buffer, width=6*inch, height=3.5*inch)
            story.append(img)
            story.append(Spacer(1, 0.2*inch))
        
        # Detailed Risk Scores
        story.append(PageBreak())
        story.append(Paragraph("Detailed Assessment Results", self.styles['SectionHeading']))
        
        for risk_score in risk_scores:
            ml_score = getattr(risk_score, 'ml_probability', None)
            if ml_score is None:
                ml_score = getattr(risk_score, 'ml_score', 0.0)
            confidence = risk_score.confidence if risk_score.confidence is not None else 0.0

            # Disability category header
            story.append(Spacer(1, 0.2*inch))
            category_title = risk_score.disability_category.title().replace('_', ' ')
            story.append(Paragraph(
                f"<b>{category_title}</b>",
                self.styles['Heading3']
            ))
            
            # Risk level badge
            risk_text = f"Risk Level: <b>{risk_score.risk_level.upper()}</b>"
            risk_para = Paragraph(risk_text, self.styles['RiskLevel'])
            story.append(risk_para)
            
            # Scores table
            scores_data = [
                ['Assessment Type', 'Score', 'Confidence'],
                ['Model Score', f"{ml_score * 100:.1f}%", f"{confidence * 100:.1f}%"],
                ['Rule-Based Score', f"{risk_score.rule_score * 100:.1f}%", ''],
                ['Overall Score', f"{risk_score.final_score * 100:.1f}%", '']
            ]
            
            scores_table = Table(scores_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
            scores_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#fef3c7')),
            ]))
            story.append(scores_table)
            
            # Explanation
            explanation = next((e for e in explanations 
                              if e.disability_category == risk_score.disability_category), None)
            
            explanation_text = None
            if explanation:
                explanation_text = getattr(explanation, 'explanation_text', None)
                if not explanation_text:
                    explanation_text = getattr(explanation, 'plain_text_explanation', None)

            if explanation_text:
                story.append(Spacer(1, 0.15*inch))
                story.append(Paragraph("<b>Explanation:</b>", self.styles['Normal']))
                story.append(Paragraph(
                    explanation_text,
                    self.styles['Normal']
                ))
        
        # Recommendations Section
        story.append(PageBreak())
        story.append(Paragraph("Recommendations", self.styles['SectionHeading']))
        
        story.append(Paragraph(
            "Based on the assessment results, the following interventions and accommodations are recommended:",
            self.styles['Normal']
        ))
        story.append(Spacer(1, 0.2*inch))
        
        for recommendation in recommendations:
            if recommendation.risk_level in ['moderate', 'high']:
                category_title = recommendation.disability_category.title().replace('_', ' ')
                story.append(Paragraph(
                    f"<b>{category_title} - {recommendation.risk_level.title()} Risk</b>",
                    self.styles['Heading4']
                ))
                
                # Classroom accommodations
                if recommendation.classroom_accommodations:
                    story.append(Paragraph("<b>Classroom Accommodations:</b>", self.styles['Normal']))
                    for acc in recommendation.classroom_accommodations[:5]:  # Top 5
                        story.append(Paragraph(f"• {acc}", self.styles['Normal']))
                    story.append(Spacer(1, 0.1*inch))
                
                # Practice exercises
                if recommendation.practice_exercises:
                    story.append(Paragraph("<b>Practice Exercises:</b>", self.styles['Normal']))
                    for ex in recommendation.practice_exercises[:5]:  # Top 5
                        story.append(Paragraph(f"• {ex}", self.styles['Normal']))
                    story.append(Spacer(1, 0.15*inch))
        
        # Disclaimer
        story.append(PageBreak())
        story.append(Paragraph("Important Notice", self.styles['SectionHeading']))
        
        disclaimer_text = """
        <b>This is an educational screening tool and NOT a diagnostic assessment.</b><br/><br/>
        
        This report provides an indication of potential learning difficulties based on standardized task performance. 
        It should be used as part of a comprehensive evaluation process by qualified educational professionals.<br/><br/>
        
        <b>Key Points:</b><br/>
        • This screening does not constitute a clinical diagnosis<br/>
        • Results should be interpreted by trained educators or specialists<br/>
        • A comprehensive evaluation is recommended for students showing moderate to high risk<br/>
        • Multiple assessments over time provide more reliable indicators<br/>
        • Environmental, emotional, and situational factors can affect performance<br/><br/>
        
        <b>Next Steps:</b><br/>
        For students identified with moderate to high risk levels, consider:<br/>
        • Consultation with special education professionals<br/>
        • Further comprehensive diagnostic testing<br/>
        • Implementation of recommended accommodations<br/>
        • Progress monitoring and reassessment<br/>
        • Parent/guardian consultation and support planning
        """
        
        story.append(Paragraph(disclaimer_text, self.styles['Normal']))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        footer_text = f"<i>Report generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</i>"
        story.append(Paragraph(footer_text, self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return output_path
    
    def generate_summary_report(self, student_id, output_path=None):
        """
        Generate a summary report across all assessments for a student
        
        Args:
            student_id: ID of the student
            output_path: Optional path to save PDF
            
        Returns:
            Path to generated PDF file
        """
        student = Student.query.get(student_id)
        if not student:
            raise ValueError(f"Student {student_id} not found")
        
        sessions = AssessmentSession.query.filter_by(
            student_id=student_id,
            status='completed'
        ).order_by(AssessmentSession.created_at.desc()).all()
        
        if not sessions:
            raise ValueError(f"No completed assessments found for student {student_id}")
        
        # Set up output path
        if not output_path:
            reports_dir = 'reports'
            os.makedirs(reports_dir, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = os.path.join(
                reports_dir,
                f"progress_report_{student.student_id}_{timestamp}.pdf"
            )
        
        # Create PDF
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        story = []
        
        # Title
        story.append(Paragraph(
            "Student Progress Report",
            self.styles['CustomTitle']
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Student info
        story.append(Paragraph("Student Information", self.styles['SectionHeading']))
        student_info = f"""
        <b>Name:</b> {student.first_name} {student.last_name}<br/>
        <b>Student ID:</b> {student.student_id}<br/>
        <b>Current Grade:</b> {student.grade}<br/>
        <b>Total Assessments:</b> {len(sessions)}
        """
        story.append(Paragraph(student_info, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Assessment history
        story.append(Paragraph("Assessment History", self.styles['SectionHeading']))
        
        for session in sessions:
            risk_scores = RiskScore.query.filter_by(session_id=session.session_id).all()
            
            story.append(Paragraph(
                f"<b>Assessment Date:</b> {session.created_at.strftime('%B %d, %Y')}",
                self.styles['Normal']
            ))
            
            # Risk summary table
            if risk_scores:
                risk_data = [['Disability', 'Risk Level', 'Score']]
                for score in risk_scores:
                    risk_data.append([
                        score.disability_category.title(),
                        score.risk_level.title(),
                        f"{score.final_score * 100:.1f}%"
                    ])
                
                risk_table = Table(risk_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
                risk_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('PADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(risk_table)
            
            story.append(Spacer(1, 0.2*inch))
        
        # Build PDF
        doc.build(story)
        
        return output_path


# Convenience function
def generate_assessment_report(session_id):
    """Generate PDF report for an assessment session"""
    generator = ReportGenerator()
    return generator.generate_report(session_id)


def generate_student_progress_report(student_id):
    """Generate PDF progress report for a student"""
    generator = ReportGenerator()
    return generator.generate_summary_report(student_id)
