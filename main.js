let imgElement = document.getElementById('input')
imgElement.onload = () => {
  let src = cv.imread('input');
  let dst = cv.Mat.ones(src.rows, src.cols, cv.CV_8UC3);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.Canny(src, src, 50, 200, 3);

  let lines = new cv.Mat();
  cv.HoughLines(src, lines, 1, Math.PI / 180, 50, 0, 0, 0, Math.PI);
  for (let i = 0; i < lines.rows; ++i) {
    let rho = lines.data32F[i * 2];
    let theta = lines.data32F[i * 2 + 1];
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
    let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
    cv.line(dst, startPoint, endPoint, [255, 255, 255, 100]);
  }

  let circles = new cv.Mat();
  cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT, 1, 1, 25, 25, 1, 100000);
  for (let i = 0; i < circles.cols; ++i) {
    let x = circles.data32F[i * 3];
    let y = circles.data32F[i * 3 + 1];
    let radius = circles.data32F[i * 3 + 2];
    let center = new cv.Point(x, y);
    cv.circle(dst, center, radius, [255, 255, 255, 100]);
  }

  cv.imshow('output', dst);
  src.delete(); dst.delete(); lines.delete(); circles.delete();
}

let inputElement = document.getElementById('file');
inputElement.addEventListener('change', (e) => {
  console.log(URL.createObjectURL(e.target.files[0]))
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);