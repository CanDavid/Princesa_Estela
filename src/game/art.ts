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

  // Estela: una princesa original, construida en capas para conservar una silueta clara.
  g.fillStyle(0x5b2b24).fillCircle(128, 92, 62).fillCircle(91, 116, 40).fillCircle(163, 115, 42);
  g.fillStyle(0xf4ba72).fillTriangle(92, 35, 112, 2, 126, 39).fillTriangle(116, 34, 140, 0, 151, 40).fillTriangle(141, 38, 169, 9, 176, 49);
  g.fillStyle(0xffdf57).fillTriangle(93, 42, 111, 6, 125, 42).fillTriangle(116, 40, 140, 3, 153, 42).fillTriangle(143, 42, 170, 11, 176, 47).fillRect(95, 38, 80, 22);
  g.lineStyle(5, 0xc87b20, 1).strokeRect(96, 39, 78, 20);
  g.fillStyle(0xffd0ad).fillCircle(132, 91, 46);
  g.fillStyle(0x4a2424).fillCircle(115, 88, 4).fillCircle(148, 88, 4);
  g.lineStyle(4, 0xc96d73, 1).beginPath().arc(132, 99, 14, 0.2, Math.PI - 0.2).strokePath();
  g.fillStyle(0xff8fbc).fillCircle(105, 103, 8).fillCircle(159, 103, 8);
  g.fillStyle(0xff8dbd).fillCircle(87, 161, 27).fillCircle(179, 161, 27);
  g.fillStyle(0xffc8df).fillCircle(87, 155, 20).fillCircle(179, 155, 20);
  g.fillStyle(0xf3539d).fillRoundedRect(94, 128, 77, 92, 28);
  g.fillStyle(0xd62c87).fillTriangle(132, 177, 43, 332, 221, 332);
  g.fillStyle(0xf558a5).fillTriangle(132, 168, 74, 332, 190, 332);
  g.fillStyle(0xff9cca).fillTriangle(132, 176, 108, 330, 159, 330);
  g.fillStyle(0xffd94c).fillCircle(132, 190, 9);
  g.lineStyle(5, 0xffffff, 0.5).beginPath().moveTo(104, 145).lineTo(132, 190).lineTo(160, 145).strokePath();
  g.generateTexture('estela', 265, 340);
  g.clear();

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
