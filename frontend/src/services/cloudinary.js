const CLOUD_NAME = 'dsgstzbpq';
const UPLOAD_PRESET = 'cultiva_ups';

export async function uploadImagem(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem.');
  }

  const data = await response.json();
  return data.secure_url;
}