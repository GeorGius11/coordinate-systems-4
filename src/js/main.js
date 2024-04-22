const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const mainSVG = document.createElementNS(SVG_NAMESPACE, "svg");
const svgDims = { height: 400, width: 950 };

mainSVG.setAttribute("width", svgDims.width);
mainSVG.setAttribute("height", svgDims.height);
document.body.appendChild(mainSVG);

function processCities(data) {
  const visualizationScale = 50;
  const dotRadius = 3.5;
  const hoverRadius = 15; // Larger radius for better hover interaction
  let xOffsetMinimum = Infinity;
  let yOffsetMinimum = Infinity;

  data.cities.forEach((city) => {
    xOffsetMinimum = Math.min(xOffsetMinimum, city.coordinates[0]);
    yOffsetMinimum = Math.min(yOffsetMinimum, city.coordinates[1]);
  });

  data.cities.forEach((city) => {
    const cityX = city.coordinates[0];
    const cityY = city.coordinates[1];
    const labelOffset = { x: 10, y: 5 };

    const cityMarker = document.createElementNS(SVG_NAMESPACE, "circle");
    cityMarker.setAttribute(
      "cx",
      13 + (cityX - xOffsetMinimum) * visualizationScale
    );
    cityMarker.setAttribute(
      "cy",
      svgDims.height - 22 - (cityY - yOffsetMinimum) * visualizationScale
    );
    cityMarker.setAttribute("stroke", "yellow");
    cityMarker.setAttribute("fill", "transparent");
    cityMarker.setAttribute("stroke-width", 2.5);
    cityMarker.setAttribute("r", dotRadius);

    const hoverCircle = document.createElementNS(SVG_NAMESPACE, "circle");
    hoverCircle.setAttribute(
      "cx",
      13 + (cityX - xOffsetMinimum) * visualizationScale
    );
    hoverCircle.setAttribute(
      "cy",
      svgDims.height - 22 - (cityY - yOffsetMinimum) * visualizationScale
    );
    hoverCircle.setAttribute("r", hoverRadius);
    hoverCircle.setAttribute("fill", "transparent");
    hoverCircle.style.pointerEvents = "visible";

    const cityLabel = document.createElementNS(SVG_NAMESPACE, "text");
    cityLabel.setAttribute(
      "x",
      13 + labelOffset.x + (cityX - xOffsetMinimum) * visualizationScale
    );
    cityLabel.setAttribute(
      "y",
      svgDims.height -
        22 +
        labelOffset.y -
        (cityY - yOffsetMinimum) * visualizationScale
    );
    cityLabel.textContent = city.name;
    cityLabel.id = city.name;
    cityLabel.setAttribute("fill", "white");
    cityLabel.classList.add("animatable", "hidden");

    hoverCircle.addEventListener("mouseenter", () =>
      document.getElementById(city.name).classList.remove("hidden")
    );
    hoverCircle.addEventListener("mouseleave", () =>
      document.getElementById(city.name).classList.add("hidden")
    );

    mainSVG.appendChild(cityMarker);
    mainSVG.appendChild(hoverCircle);
    mainSVG.appendChild(cityLabel);
  });
}

function drawBoundaries(data) {
  const pathScale = 50;
  let xBoundaryMin = Infinity;
  let yBoundaryMin = Infinity;

  data[0].geo_shape.geometry.coordinates[0].forEach((coord) => {
    xBoundaryMin = Math.min(xBoundaryMin, coord[0]);
    yBoundaryMin = Math.min(yBoundaryMin, coord[1]);
  });

  const boundaryPath = document.createElementNS(SVG_NAMESPACE, "path");
  let boundaryPathData = "M ";
  data[0].geo_shape.geometry.coordinates[0].forEach((coord) => {
    boundaryPathData += `${(coord[0] - xBoundaryMin) * pathScale} ${
      svgDims.height - (coord[1] - yBoundaryMin) * pathScale
    } `;
  });
  boundaryPathData += "Z";
  boundaryPath.setAttribute("d", boundaryPathData);
  boundaryPath.setAttribute("stroke", "blue");
  boundaryPath.setAttribute("fill", "none");
  boundaryPath.setAttribute("stroke-width", 2.5);

  mainSVG.insertBefore(boundaryPath, mainSVG.firstChild);
}

fetch("data/ua-administrative-boundaries.json")
  .then((response) => response.json())
  .then(drawBoundaries)
  .then(() =>
    fetch("data/ua-cities.json")
      .then((response) => response.json())
      .then(processCities)
  );
