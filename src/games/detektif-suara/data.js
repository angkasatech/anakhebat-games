const groups = {
 b: [['bola','⚽'],['buku','📚'],['baju','👕'],['bebek','🦆'],['bunga','🌼'],['balon','🎈']],
 k: [['kucing','🐈'],['kursi','🪑'],['kue','🍰'],['kaki','🦶'],['kapal','🚢'],['kelinci','🐇']],
 m: [['mata','👁️'],['meja','🪑'],['mobil','🚗'],['mangga','🥭'],['melon','🍈'],['madu','🍯']],
 s: [['sapi','🐄'],['sandal','🩴'],['sendok','🥄'],['susu','🥛'],['singa','🦁'],['semangka','🍉']],
 p: [['padi','🌾'],['pintu','🚪'],['pisang','🍌'],['payung','☂️'],['pensil','✏️'],['pohon','🌳']],
 d: [['dadu','🎲'],['daun','🍃'],['domba','🐑'],['durian','🍈'],['dokter','🧑‍⚕️'],['donat','🍩']],
 t: [['topi','🎩'],['tangan','✋'],['telur','🥚'],['tikus','🐁'],['tas','🎒'],['tomat','🍅']],
 g: [['gula','🧊'],['gajah','🐘'],['gitar','🎸'],['gunung','⛰️'],['gelas','🥛'],['gigi','🦷']],
 n: [['nanas','🍍'],['nasi','🍚'],['naga','🐉'],['nyamuk','🦟'],['nuri','🦜'],['nangka','🍈']],
 c: [['cacing','🪱'],['cangkir','☕'],['cicak','🦎'],['cumi','🦑'],['cokelat','🍫'],['cabai','🌶️']],
};
// /ny/ is a different phoneme from /n/: use a concrete /n/ word instead.
groups.n[3] = ['nampan','🍽️'];
export const words = Object.entries(groups).flatMap(([sound,items])=>items.map(([id,picture])=>({id,label:id,sound,picture})));
export const levels = [{id:'calm',name:'Mulai Santai',note:'Dua pilihan · banyak bantuan',count:2},{id:'explore',name:'Mulai Menjelajah',note:'Tiga pilihan · dengar dan bandingkan',count:3},{id:'challenge',name:'Tantangan Detektif',note:'Lebih banyak gambar · bunyi mirip',count:4}];
export const locations = ['Taman Bunyi','Dapur Ceria','Kebun Kata','Garasi Kendaraan','Pasar Mini'];
export const missionNames = ['Dengarkan dan Tebak','Teman Bunyi Awal','Pilih Bunyi Pertama','Detektif Bunyi Mirip','Pecahkan Kode Bunyi'];
export const environments = [{id:'rain',label:'hujan',picture:'🌧️',clue:'Rintik turun dari awan. Tik, tik, tik.'},{id:'bell',label:'bel sepeda',picture:'🚲',clue:'Ada di sepeda. Ting, ting!'},{id:'car',label:'mobil',picture:'🚗',clue:'Kendaraan beroda empat. Brrum!'}];
export const pairs = [['b','p'],['d','t'],['k','g'],['m','n'],['s','c']];
