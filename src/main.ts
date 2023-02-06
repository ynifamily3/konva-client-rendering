import { draw, emptyImageData } from "./draw";
import { ABCData } from "./schema";
import "./style.css";

window.addEventListener("load", fn);

function transformData(input: string): ABCData | null {
  try {
    const parsed = JSON.parse(input) as ABCData;
    return parsed;
  } catch (e) {
    console.warn(e);
    return null;
  }
}

function fn() {
  const generateButton = document.getElementById(
    "generate_button"
  ) as HTMLButtonElement;
  const jsonInput = document.getElementById(
    "json_input"
  ) as HTMLTextAreaElement;
  const img = document.getElementById("result_image") as HTMLImageElement;

  generateButton.addEventListener("click", async () => {
    const json = transformData(jsonInput.value);
    if (!json) {
      alert("json 오류");
      return;
    }
    if (!img.width) {
      img.width = 300;
      img.height = 300;
    }
    img.src = emptyImageData;
    try {
      const result = await draw(json.data[0]);
      if (result.size) {
        img.width = result.size.width;
        img.height = result.size.height;
      }
      img.src = result.src;
    } catch (e) {
      console.warn(e);
      alert("렌더링 오류");
    }
  });
  // app.innerHTML = "hi";
}
