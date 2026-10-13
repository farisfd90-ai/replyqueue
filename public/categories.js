export const MODEL = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
export const categories = [
  { id: 'delivery', name: 'Delivery', action: 'Check tracking and delivery estimate.', examples: ['Where is my parcel? It has not arrived.', 'Can you check the tracking and delivery date?', 'Bila barang saya akan sampai?', 'Parcel belum sampai, boleh semak tracking?'] },
  { id: 'refund', name: 'Returns & refunds', action: 'Check the issue and your returns policy.', examples: ['The item arrived broken. I want to return it for a refund.', 'Can I exchange this damaged product?', 'Barang rosak. Saya nak pulangkan dan minta bayaran balik.', 'Boleh tukar barang yang salah saiz?'] },
  { id: 'sales', name: 'Product enquiry', action: 'Confirm stock, options, and price.', examples: ['Is this item available? What is the price?', 'Do you have this product in a different size or colour?', 'Ada stok warna biru? Berapa harga?', 'Boleh beri harga dan pilihan saiz produk ini?'] },
  { id: 'changes', name: 'Order changes', action: 'Confirm whether the order can still be changed.', examples: ['Please cancel my order before it ships.', 'I need to change the address or quantity on my order.', 'Saya nak batalkan pesanan sebelum dihantar.', 'Boleh tukar alamat penghantaran pesanan saya?'] },
  { id: 'review', name: 'Needs review', action: 'Read the message and choose the right category.', examples: ['Thanks, I received the item and everything is good.', 'Terima kasih, barang dah sampai. Semua okay.', 'I have several requests: a refund and an address change.', 'I am not sure whether to return this or cancel my order.', 'This question is unrelated to a product or an order.'] }
];
export const demoMessages = [
  'Parcel dah shipped ke? Tracking tak bergerak sejak semalam.',
  'The mug arrived cracked. Can I return it?',
  'Ada saiz M warna hitam? Harga termasuk postage?',
  'Please update my delivery address before you send the order.',
  'Thanks, received it today!',
  'I want to change the size, but the parcel is already here.'
];
