import { useCallback, useEffect, useRef, useState } from "react";

const AnnotationViewer = ({
  annotations = [],
  currentPage,
  onSelectAnnotation,
  selectedAnnotationId,
  respondedAnnotationIds = [],
  zoomLevel = 1,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const studentAnnotations = annotations.filter(
    (anno) => anno.pageNumber === currentPage
  );

  useEffect(() => {
    const imageElement = document.querySelector(".will-change-transform img");

    if (!imageElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setImageDimensions({ width, height });
      }
    });

    resizeObserver.observe(imageElement);

    return () => resizeObserver.unobserve(imageElement);
  }, [currentPage, zoomLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageDimensions.width) return;

    const ctx = canvas.getContext("2d");
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    studentAnnotations.forEach((anno) => {
      const { startX, startY, endX, endY } = anno.coordinates || {};

      const pixelLeft = (Math.min(startX, endX) / 100) * canvas.width;
      const pixelTop = (Math.min(startY, endY) / 100) * canvas.height;
      const pixelWidth = (Math.abs(endX - startX) / 100) * canvas.width;
      const pixelHeight = (Math.abs(endY - startY) / 100) * canvas.height;

      const annotationId = anno.id || anno.annotation_id;
      const isSelected = annotationId === selectedAnnotationId;
      const isResponded =
        respondedAnnotationIds.includes(annotationId) ||
        anno.status === "accepted" ||
        anno.status === "rejected";

      ctx.fillStyle = isResponded
        ? "rgba(34, 197, 94, 0.3)"
        : "rgba(59, 130, 246, 0.3)";
      ctx.strokeStyle = isResponded ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)";
      ctx.lineWidth = isSelected ? 4 : 3;

      ctx.fillRect(pixelLeft, pixelTop, pixelWidth, pixelHeight);
      ctx.strokeRect(pixelLeft, pixelTop, pixelWidth, pixelHeight);

      const questionNumber = anno.questionNumber || "?";
      const labelX = pixelLeft + 5;
      const labelY = pixelTop - 10;

      ctx.fillStyle = isResponded ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)";
      ctx.beginPath();
      ctx.arc(labelX + 10, labelY - 10, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 12px Arial";
      ctx.fillText(questionNumber.toString(), labelX + 10, labelY - 10);
    });
  }, [
    studentAnnotations,
    imageDimensions,
    selectedAnnotationId,
    respondedAnnotationIds,
    zoomLevel,
  ]);

  const handleCanvasClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas || studentAnnotations.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickXPercent = (x / canvas.width) * 100;
      const clickYPercent = (y / canvas.height) * 100;

      for (const anno of studentAnnotations) {
        const { startX, startY, endX, endY } = anno.coordinates || {};

        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);

        if (
          clickXPercent >= left &&
          clickXPercent <= right &&
          clickYPercent >= top &&
          clickYPercent <= bottom
        ) {
          onSelectAnnotation(anno);
          break;
        }
      }
    },
    [studentAnnotations, imageDimensions, onSelectAnnotation]
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto cursor-pointer"
        onClick={handleCanvasClick}
        style={{
          width: imageDimensions.width,
          height: imageDimensions.height,
          position: "absolute",
        }}
      />
    </div>
  );
};

export default AnnotationViewer;
