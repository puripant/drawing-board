let threshold = 60;
let input, src, dst;

let imgElement = document.getElementById('input')
imgElement.onload = () => {
  input = cv.imread('input');
  src = input.clone();
  // cv.imshow('output', src);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.medianBlur(src, src, 5);
  cv.Canny(src, src, 50, 200, 3);
  // cv.imshow('intermediate', src);

  update(threshold);
}

let inputElement = document.getElementById('file');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

// const range = document.getElementById('threshold');
// range.addEventListener('input', () => {
//   console.log('input')
//   update(+range.value);
// });

function update(threshold) {
  dst = input.clone() //cv.Mat.ones(src.rows, src.cols, cv.CV_8UC3);

  findLines(threshold);
  findCircles(threshold/2);

  cv.imshow('output', dst);
  dst.delete();
}
function findLines(threshold) {
  let lines = new cv.Mat();
  cv.HoughLines(src, lines, 1, Math.PI / 180, threshold, 0, 0, 0, Math.PI);
  for (let i = 0; i < lines.rows; ++i) {
    let rho = Math.round(lines.data32F[i * 2] / 10) * 10;
    let theta = Math.round(lines.data32F[i * 2 + 1] * 10) / 10;
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
    let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
    cv.line(dst, startPoint, endPoint, [100, 100, 100, 100]);
  }
  lines.delete();
}
function findCircles(threshold) {
  let circles = new cv.Mat();
  cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT, 1, 1, threshold, threshold, 1, 100000);
  for (let i = 0; i < circles.cols; ++i) {
    let x = Math.round(circles.data32F[i * 3] / 10) * 10;
    let y = Math.round(circles.data32F[i * 3 + 1] / 10) * 10;
    let radius = Math.round(circles.data32F[i * 3 + 2]);
    let center = new cv.Point(x, y);
    cv.circle(dst, center, radius, [100, 100, 100, 100]);
  }
  circles.delete();
}