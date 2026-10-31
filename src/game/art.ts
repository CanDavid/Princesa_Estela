import Phaser from 'phaser';

function polygon(cx: number, cy: number, radius: number, points: number, innerRatio = 0.46): Phaser.Geom.Point[] {
  return Array.from({ length: points * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / points;
    const length = index % 2 === 0 ? radius : radius * innerRatio;
    return new Phaser.Geom.Point(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
  });
}

export function createArtTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();

  // Bichito alado, cómico y amable.
  g.fillStyle(0xe8f7ff, 0.92).fillEllipse(34, 42, 52, 42).fillEllipse(102, 42, 52, 42);
  g.lineStyle(4, 0x80b8d4, 0.8).strokeEllipse(34, 42, 52, 42).strokeEllipse(102, 42, 52, 42);
  g.fillStyle(0x9a5a34).fillEllipse(68, 53, 76, 64);
  g.fillStyle(0xb97343).fillCircle(68, 27, 25);
  g.fillStyle(0xffffff).fillCircle(58, 25, 9).fillCircle(78, 25, 9);
  g.fillStyle(0x40251f).fillCircle(60, 27, 4).fillCircle(76, 27, 4);
  g.lineStyle(4, 0x4d2b23, 1).beginPath().arc(68, 44, 13, 0.15, Math.PI - 0.15).strokePath();
  g.fillStyle(0xe99970).fillCircle(45, 42, 6).fillCircle(91, 42, 6);
  g.generateTexture('bug', 136, 90);
  g.clear();

  // Hada celebratoria.
  g.fillStyle(0xe7fbff, 0.72).fillEllipse(46, 80, 48, 86).fillEllipse(118, 80, 48, 86);
  g.lineStyle(4, 0xaad7f6, 0.8).strokeEllipse(46, 80, 48, 86).strokeEllipse(118, 80, 48, 86);
  g.fillStyle(0xf4a95f).fillCircle(82, 45, 30);
  g.fillStyle(0xb95828).fillCircle(82, 32, 31).fillCircle(62, 44, 15).fillCircle(102, 44, 15);
  g.fillStyle(0xffd0ad).fillCircle(82, 49, 25);
  g.fillStyle(0x4a2424).fillCircle(74, 47, 3).fillCircle(90, 47, 3);
  g.lineStyle(3, 0xc96d73, 1).beginPath().arc(82, 55, 9, 0.2, Math.PI - 0.2).strokePath();
  g.fillStyle(0x73d8d5).fillTriangle(82, 69, 39, 153, 125, 153);
  g.fillStyle(0xa9f1e8).fillTriangle(82, 75, 60, 153, 105, 153);
  g.lineStyle(7, 0xf4b477, 1).lineBetween(67, 83, 34, 105).lineBetween(97, 83, 130, 105);
  g.fillStyle(0xffd343).fillPoints(polygon(29, 101, 16, 5), true);
  g.generateTexture('fairy', 164, 170);
  g.clear();

  // Cazamariposas, con el punto de agarre en la esquina inferior izquierda.
  g.lineStyle(12, 0x7b431f, 1).lineBetween(28, 160, 153, 62);
  g.lineStyle(8, 0x9f5b2d, 1).lineBetween(28, 160, 153, 62);
  g.lineStyle(9, 0x7b431f, 1).strokeEllipse(190, 45, 100, 72);
  g.lineStyle(4, 0xf2e7ff, 0.95).strokeEllipse(190, 45, 88, 62);
  for (let offset = -26; offset <= 26; offset += 13) {
    g.lineStyle(2, 0xe7d8ff, 0.82).lineBetween(148, 45 + offset, 232, 45 + offset);
  }
  for (let offset = -28; offset <= 28; offset += 14) {
    g.lineStyle(2, 0xe7d8ff, 0.82).lineBetween(190 + offset, 17, 190 + offset, 73);
  }
  g.generateTexture('net', 250, 180);
  g.clear();

  g.fillStyle(0xffd21f).fillPoints(polygon(42, 42, 38, 5), true);
  g.lineStyle(5, 0xff8f00, 1).strokePoints(polygon(42, 42, 38, 5), true, true);
  g.fillStyle(0xffffff, 0.85).fillCircle(31, 28, 6);
  g.generateTexture('star', 84, 84);
  g.clear();

  g.fillStyle(0xfff4a8, 0.24).fillCircle(70, 70, 68);
  g.fillStyle(0xfff7cb, 0.36).fillCircle(70, 70, 45);
  g.generateTexture('glow', 140, 140);
  g.destroy();
}
