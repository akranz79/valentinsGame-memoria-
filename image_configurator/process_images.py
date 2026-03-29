from PIL import Image
import os

# --- CONFIGURAÇÕES ---
INPUT_DIR = 'input'
OUTPUT_DIR = 'output'
FRAME_PATH = 'frame.png'

# Tamanho final da carta em pixels (deve ser igual ao tamanho da sua moldura)
CARD_SIZE = (150, 150)

# Preenchimento (padding) entre a borda da imagem e a moldura
IMAGE_PADDING = 15

def process_images():
    """
    Aplica uma moldura a todas as imagens em um diretório de entrada
    e as salva em um diretório de saída.
    """
    # Cria o diretório de saída se ele não existir
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Carrega a imagem da moldura
    try:
        frame = Image.open(FRAME_PATH).convert("RGBA")
        if frame.size != CARD_SIZE:
            frame = frame.resize(CARD_SIZE, Image.Resampling.LANCZOS)
    except FileNotFoundError:
        print(f"ERRO: A imagem da moldura '{FRAME_PATH}' não foi encontrada.")
        return

    # Lista os arquivos de imagem no diretório de entrada
    try:
        image_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg'))]
    except FileNotFoundError:
        print(f"ERRO: O diretório de entrada '{INPUT_DIR}' não foi encontrado.")
        return

    print(f"Encontradas {len(image_files)} imagens para processar...")

    for filename in image_files:
        input_path = os.path.join(INPUT_DIR, filename)
        output_filename = os.path.splitext(filename)[0] + '.png' # Salva como PNG para manter a transparência
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        with Image.open(input_path).convert("RGBA") as img:
            # Calcula o tamanho máximo para o ícone, mantendo a proporção
            inner_size = (CARD_SIZE[0] - IMAGE_PADDING * 2, CARD_SIZE[1] - IMAGE_PADDING * 2)
            img.thumbnail(inner_size, Image.Resampling.LANCZOS)

            # Cria uma tela em branco para a nova carta
            card_canvas = Image.new('RGBA', CARD_SIZE, (0, 0, 0, 0))

            # Calcula a posição para centralizar o ícone na tela
            paste_x = (CARD_SIZE[0] - img.width) // 2
            paste_y = (CARD_SIZE[1] - img.height) // 2

            # Cola o ícone na tela
            card_canvas.paste(img, (paste_x, paste_y), img)

            # Combina a tela com a moldura por cima
            final_image = Image.alpha_composite(card_canvas, frame)
            final_image.save(output_path, 'PNG')
            print(f" -> '{output_path}' criada com sucesso.")

    print("\nProcessamento concluído!")

if __name__ == "__main__":
    process_images()