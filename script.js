document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("fileInput").addEventListener("change", function() {
    displayImage(this);
  });

  // Assign event listeners to buttons
  document.querySelector('button[onclick="encodeImage()"]').addEventListener("click", encodeImage);
  document.querySelector('button[onclick="downloadImage()"]').addEventListener("click", downloadImage);
  document.querySelector('button[onclick="downloadCSS()"]').addEventListener("click", downloadCSS);
  document.querySelector('button[onclick="copyToClipboard()"]').addEventListener("click", copyToClipboard);
  document.querySelector('button[onclick="downloadHTML()"]').addEventListener("click", downloadHTML);
  document.querySelector('button[onclick="convertToSVG()"]').addEventListener("click", convertToSVG);
  document.querySelector('button[onclick="downloadIcons()"]').addEventListener("click", downloadIcons);

  // Assign event listener to the RemoveBG button
  document.getElementById("noBackgroundButton").addEventListener("click", downloadTransparentPNG);
});

function encodeImage() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    const base64EncodedImage = event.target.result;
    document.getElementById("encodedImage").innerHTML = `<img src="${base64EncodedImage}" alt="Encoded Image">`;
    document.getElementById("encodedCode").value = base64EncodedImage;
  };

  reader.readAsDataURL(file);
}

function copyToClipboard() {
  const textarea = document.getElementById("encodedCode");
  textarea.select();
  document.execCommand("copy");
  alert("Base64 copied to clipboard!");
}

function downloadImage() {
  const base64EncodedImage = document.getElementById("encodedCode").value;
  const blob = new Blob([base64EncodedImage], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "base64.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("Text file downloaded!");
}

function downloadCSS() {
  const base64EncodedImage = document.getElementById("encodedCode").value;
  const cssContent = `body {
    background-image: url("${base64EncodedImage}");
    background-repeat: no-repeat;
    background-size: 80%;
    background-attachment: fixed;
  }`;
  const blob = new Blob([cssContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "styles.css";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("CSS file downloaded!");
}

function downloadHTML() {
  const base64EncodedImage = document.getElementById("encodedCode").value;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Base64</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <img src="${base64EncodedImage}" alt="Encoded Image">
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "index.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("html file downloaded!");
}

function convertToSVG() {
  const base64EncodedImage = document.getElementById("encodedCode").value;
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
      <image href="${base64EncodedImage}" x="0" y="0" width="100%" height="100%"/>
    </svg>
  `;
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "image.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("SVG file downloaded!");
}

function displayImage(input) {
  const file = input.files[0];
  const imageType = /image.*/;

  if (file.type.match(imageType)) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const img = new Image();
      img.src = reader.result;

      img.onload = function() {
        const width = this.width;
        const height = this.height;
        document.getElementById("thumbnail").src = this.src;
        document.getElementById("thumbnail").style.display = "inline";
        document.getElementById("resolution").innerText = `${width} x ${height}`;
      };
    };

    reader.readAsDataURL(file);
  } else {
    alert("File format not supported!");
  }
}

async function downloadTransparentPNG() {
  const base64EncodedImage = document.getElementById("encodedCode").value;

  async function createTransparentPNGBlob(base64Image, width, height) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    const img = new Image();
    img.src = base64Image;

    return new Promise((resolve) => {
      img.onload = function () {
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Loop through each pixel and make white transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

        
          if (r > 240 && g > 240 && b > 240) {
   
            data[i + 3] = 0;
          }
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };
    });
  }

 
  const transparentBlob = await createTransparentPNGBlob(base64EncodedImage, 512, 512);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(transparentBlob);
  link.download = "no-background.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("No Background PNG downloaded!");
}

async function downloadIcons() {
  const base64EncodedImage = document.getElementById("encodedCode").value;

  function createImageBlob(base64Image, width, height) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    const img = new Image();
    img.src = base64Image;

    return new Promise((resolve) => {
      img.onload = function() {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };
    });
  }

  async function downloadFile(blob, size) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `icon-${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const sizes = [16, 32, 48, 64, 128, 256, 512];
  for (const size of sizes) {
    const blob = await createImageBlob(base64EncodedImage, size, size);
    await downloadFile(blob, size);
  }
}
