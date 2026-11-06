import { CertificateItem } from '../types';

export function downloadCertificateAsImage(
  item: CertificateItem,
  displayName: string,
  scoreText: string,
  docTitle: string,
  primaryColor: string
): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer border
  ctx.strokeStyle = '#C9B992';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Inner border
  ctx.strokeStyle = '#E8DFC8';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Corner decorations
  const cornerSize = 36;
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 6;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(70, 70 + cornerSize); ctx.lineTo(70, 70); ctx.lineTo(70 + cornerSize, 70);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(canvas.width - 70 - cornerSize, 70); ctx.lineTo(canvas.width - 70, 70); ctx.lineTo(canvas.width - 70, 70 + cornerSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(70, canvas.height - 70 - cornerSize); ctx.lineTo(70, canvas.height - 70); ctx.lineTo(70 + cornerSize, canvas.height - 70);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(canvas.width - 70 - cornerSize, canvas.height - 70); ctx.lineTo(canvas.width - 70, canvas.height - 70); ctx.lineTo(canvas.width - 70, canvas.height - 70 - cornerSize);
  ctx.stroke();

  // Watermark text in center
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-0.35);
  ctx.fillStyle = 'rgba(19, 41, 75, 0.04)';
  ctx.font = '900 130px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SMART START', 0, 0);
  ctx.restore();

  // Header
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SMART START XUSUSIY MAKTABI', 100, 115);

  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(docTitle, 100, 160);

  // Cert Number badge
  const certNumber = item.certNumber || `SS-${item.year}-${item.id}`;
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(canvas.width - 360, 100, 260, 50);
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width - 360, 100, 260, 50);
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`✓ ${certNumber}`, canvas.width - 230, 132);

  // Divider
  ctx.strokeStyle = '#ECE5D3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 195); ctx.lineTo(canvas.width - 100, 195); ctx.stroke();

  // "Ushbu sertifikat tasdiqlaydi:"
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('USHBU SERTIFIKAT TASDIQLAYDI:', canvas.width / 2, 265);

  // Student Name
  ctx.fillStyle = '#13294B';
  ctx.font = '900 60px sans-serif';
  ctx.fillText(displayName, canvas.width / 2, 350);

  // Description
  ctx.fillStyle = '#475569';
  ctx.font = '22px sans-serif';
  ctx.fillText(
    `Smart Start xususiy maktabining ${item.grade}-sinf o'quvchisi quyidagi xalqaro/davlat sinovida yuksak natijani qayd etdi:`,
    canvas.width / 2,
    410
  );

  // Score Box
  const boxW = 380;
  const boxH = 180;
  const boxX = (canvas.width - boxW) / 2;
  const boxY = 460;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('QAYD ETILGAN NATIJA', canvas.width / 2, boxY + 40);

  ctx.fillStyle = primaryColor;
  ctx.font = '900 68px sans-serif';
  ctx.fillText(scoreText, canvas.width / 2, boxY + 115);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`${item.type} ${item.subject ? `(${item.subject})` : ''}`, canvas.width / 2, boxY + 155);

  // Subscores if available
  if (item.subScores) {
    const subText = Object.entries(item.subScores)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join('   |   ');
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(subText, canvas.width / 2, 690);
  }

  // Footer divider
  ctx.strokeStyle = '#ECE5D3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 755); ctx.lineTo(canvas.width - 100, 755); ctx.stroke();

  // Board & Date
  ctx.fillStyle = '#13294B';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Smart Start Examination Board', 120, 815);
  ctx.fillStyle = '#64748B';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Tashkent, O'zbekiston · ${item.date || `${item.year}-yil`}`, 120, 850);

  // Stamp / Seal circle on right
  const sealX = canvas.width - 200;
  const sealY = 825;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 55, 0, Math.PI * 2);
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SMART START', sealX, sealY - 8);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('RASMIY MUHR', sealX, sealY + 14);

  // Direct PNG download
  const link = document.createElement('a');
  const safeName = displayName.replace(/\s+/g, '_');
  link.download = `Smart_Start_${safeName}_${item.type}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
