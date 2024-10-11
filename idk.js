const texto = 'odio las pollaallala';
const malasPalabras = ['coño', 'hijo de puta', 'cabron', 'malnacido', 'gilipollas', 'subnormal', 'cabroncete', 'cabroncillo', 'carapompis', 'caranachas',
    'imbecil', 'zoquete', 'polla', 'zorra','dick','motherfucker',''
];

const foundPalabra = malasPalabras.find(palabra => texto.includes(palabra));
if (foundPalabra) {
    console.log('⚀⚁⚂⚃⚄⚅' + foundPalabra);
} else {
    console.log('tu texto está bien');
}
