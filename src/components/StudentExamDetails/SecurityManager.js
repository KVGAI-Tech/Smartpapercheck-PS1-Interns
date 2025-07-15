const SecurityManager = {
  screenshotDetectionMethods: {
    keyboardScreenshot: (e) => {
      return (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.key === "p") ||
        (e.metaKey && e.key === "p")
      );
    },

    devTools: (e) => {
      return (
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" ||
            e.key === "i" ||
            e.key === "C" ||
            e.key === "c" ||
            e.key === "J" ||
            e.key === "j")) ||
        (e.metaKey &&
          e.shiftKey &&
          (e.key === "I" ||
            e.key === "i" ||
            e.key === "C" ||
            e.key === "c" ||
            e.key === "J" ||
            e.key === "j"))
      );
    },

    screenCapture: (e) => {
      return (
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "4" || e.key === "$" || e.key === "5" || e.key === "%")) ||
        (e.metaKey &&
          e.shiftKey &&
          (e.key === "3" ||
            e.key === "#" ||
            e.key === "4" ||
            e.key === "$" ||
            e.key === "5" ||
            e.key === "%"))
      );
    },
  },

  generateWatermark: (studentInfo, pdfContainer) => {
    if (!studentInfo || !pdfContainer) return null;

    const watermarkContainer = document.createElement("div");
    watermarkContainer.className =
      "absolute inset-0 pointer-events-none select-none";
    watermarkContainer.style.zIndex = "30";
    watermarkContainer.style.overflow = "hidden";

    const watermarkText = `${studentInfo.name} (${studentInfo.roll_number}) - CONFIDENTIAL`;
    const watermarkCount = 20;

    for (let i = 0; i < watermarkCount; i++) {
      const watermark = document.createElement("div");
      watermark.className = "absolute select-none";
      watermark.style.transform = `rotate(-30deg)`;
      watermark.style.opacity = "0.12";
      watermark.style.color = "#001a4d";
      watermark.style.fontSize = "14px";
      watermark.style.fontWeight = "bold";
      watermark.style.whiteSpace = "nowrap";
      watermark.style.top = `${5 + i * 20}%`;
      watermark.style.left = `${(i % 2) * 20}%`;
      watermark.style.fontFamily = "Arial, sans-serif";
      watermark.textContent = watermarkText;

      watermarkContainer.appendChild(watermark);
    }

    return watermarkContainer;
  },

  applySecurityFeatures: (pdfContainer, studentInfo) => {
    if (!pdfContainer) return;

    if (studentInfo) {
      const watermark = SecurityManager.generateWatermark(
        studentInfo,
        pdfContainer
      );
      if (watermark) {
        pdfContainer.appendChild(watermark);
      }
    }

    pdfContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });

    pdfContainer.addEventListener("selectstart", (e) => {
      if (e.target.closest(".pdf-content-container")) {
        e.preventDefault();
        return false;
      }
    });

    const rotateWatermarks = () => {
      const watermarks = pdfContainer.querySelectorAll(".absolute.select-none");
      watermarks.forEach((watermark) => {
        const currentRotation =
          parseInt(watermark.style.transform.replace(/[^\d-]/g, "")) || -30;
        const newRotation = currentRotation === -30 ? -35 : -30;
        watermark.style.transform = `rotate(${newRotation}deg)`;

        const currentOpacity = parseFloat(watermark.style.opacity) || 0.12;
        watermark.style.opacity = currentOpacity === 0.12 ? "0.14" : "0.12";
      });
    };

    const intervalId = setInterval(rotateWatermarks, 2500);

    return () => {
      clearInterval(intervalId);
    };
  },
};

export default SecurityManager;
