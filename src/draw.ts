import type { ABCItem, ABCResult, ClientBannerJSON } from "./schema";
import Konva from "konva";
import FontFaceObserver from "fontfaceobserver";

export const emptyImageData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3j+6SEABX4Cu9eb5dUAAAAASUVORK5CYII=`;

const resolveImage = async (imageNode: Konva.Image) => {
  const imageObj = new Image();
  imageObj.crossOrigin = "anonymous";
  imageObj.src = imageNode.attrs.imageSrc;
  return new Promise((resolve) => {
    imageObj.onload = () => {
      imageNode.image(imageObj);
      imageNode.width(imageObj.width);
      imageNode.height(imageObj.height);
      resolve({});
    };
    imageObj.onerror = () => {
      imageObj.src = emptyImageData;
    };
  });
};

const resolveText = async (textNode: Konva.Text) => {
  const font = textNode.attrs.fontFamily;
  const text = textNode.attrs.text;
  try {
    await new FontFaceObserver(font).load(text);
  } catch (e) {
    console.warn("failed to load font:", font, e);
  }
  textNode.setAttr("text", "");
  textNode.setAttr("text", text);
};

export async function drawFromClientBannerJSON(
  clientBannerJson: ClientBannerJSON
): Promise<ABCResult> {
  const container = document.createElement("div");
  const devicePixelRatio = window.devicePixelRatio || 1;
  const stage = new Konva.Stage({
    container,
    // 캔버스화 ~ blob url로 만들려면 width, height 필수
    width: clientBannerJson.width,
    height: clientBannerJson.height,
    draggable: false,
    preventDefault: true,
    listening: false,
  });
  const layer = new Konva.Layer();

  clientBannerJson.layers.forEach((item) => {
    const x = Konva.Node.create(item);
    layer.add(x);
  });

  const imageNodes: Konva.Image[] = layer.find("Image");
  const imageWork = Promise.all(imageNodes.map(resolveImage));
  const textNodes: Konva.Text[] = layer.find("Text");
  const textWork = Promise.all(textNodes.map(resolveText));

  await Promise.all([imageWork, textWork]);

  stage.add(layer);

  return await new Promise<ABCResult>((resolve, reject) => {
    try {
      stage.toDataURL({
        pixelRatio: devicePixelRatio,
        callback: (img) => {
          const src = URL.createObjectURL(
            new Blob(
              [
                Uint8Array.from(window.atob(img.split(",")[1]), (c) =>
                  c.charCodeAt(0)
                ),
              ],
              { type: "image/png" }
            )
          );
          stage.destroy();
          container.remove();
          resolve({
            src,
            size: {
              width: clientBannerJson.width,
              height: clientBannerJson.height,
            },
          });
        },
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function draw(item: ABCItem): Promise<ABCResult> {
  if (typeof item.src === "string") {
    // api 결과값이 클라이언트 렌더링 대상이 아닌 경우 (src가 string인 경우)
    return { src: item.src }; // size: undefined
  }
  const clientBannerJson = item.src;
  return await drawFromClientBannerJSON(clientBannerJson);
}
