importScripts("https://unpkg.com/konva@8/konva.min.js");
// importScripts("fontfaceobserver.js");
// monkeypatch Konva for offscreen canvas usage
Konva.Util.createCanvasElement = () => {
  const canvas = new OffscreenCanvas(1, 1);
  canvas.style = {};
  return canvas;
};

const resolveImage = async (imageNode) => {
  try {
    const imgBlob = await fetch(imageNode.attrs.imageSrc, {}).then((r) =>
      r.blob()
    );
    console.log("-->blob", imgBlob);
    const img = await createImageBitmap(imgBlob);
    imageNode.image(img);
    imageNode.width(img.width);
    imageNode.height(img.height);
  } catch (e) {
    console.log(e);
  }
};

const resolveText = async (textNode) => {
  // const font = textNode.attrs.fontFamily;
  const text = textNode.attrs.text;
  // console.log(FontFaceObserver);
  // try {
  //   await new FontFaceObserver(font).load(text);
  // } catch (e) {
  //   console.warn("failed to load font:", font, e);
  // }
  textNode.setAttr("text", "");
  textNode.setAttr("text", text);
};

// now we can create our canvas content
var stage = new Konva.Stage({
  width: 200,
  height: 200,
});

self.onmessage = function (evt) {
  var canvas = evt.data.canvas;
  var clientBannerJson = evt.data.clientBannerJson;
  // adapt stage size
  // we may need to add extra event to resize stage on a fly
  stage.setSize({
    width: canvas.width,
    height: canvas.height,
  });

  const ctx = canvas.getContext("2d");

  const layer = new Konva.Layer();
  clientBannerJson.layers.forEach((item) => {
    const x = Konva.Node.create(item);
    layer.add(x);
  });

  // Konva.Layer has support for "draw" event
  // so every time the layer is re-rendered we need to update the canvas
  layer.on("draw", (e) => {
    if (
      layer.getCanvas()._canvas.width === 0 ||
      layer.getCanvas()._canvas.height === 0
    )
      return;
    // clear content
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw layer content
    console.log("-->", layer.getCanvas()._canvas);
    ctx.drawImage(layer.getCanvas()._canvas, 0, 0);
  });

  const imageNodes = layer.find("Image");
  const imageWork = Promise.all(imageNodes.map(resolveImage));
  const textNodes = layer.find("Text");
  const textWork = Promise.all(textNodes.map(resolveText));
  Promise.all([imageWork, textWork]).then(() => {
    stage.add(layer);
    // stage.toDataURL({
    //   pixelRatio: 2, //devicePixelRatio,
    //   callback: (img) => {
    //     const src = URL.createObjectURL(
    //       new Blob(
    //         [Uint8Array.from(atob(img.split(",")[1]), (c) => c.charCodeAt(0))],
    //         { type: "image/png" }
    //       )
    //     );
    //     stage.destroy();
    //     console.log({
    //       src,
    //       size: {
    //         width: clientBannerJson.width,
    //         height: clientBannerJson.height,
    //       },
    //     });
    //     // container.remove();
    //     this.postMessage({
    //       src,
    //       size: {
    //         width: clientBannerJson.width,
    //         height: clientBannerJson.height,
    //       },
    //     });
    //   },
    // });
  });
};
