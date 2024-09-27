import React, { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';

interface AnnotatedPDFViewerProps {
  fileUrl: string;
  annotationsData: any[];
}

const AnnotatedPDFViewer: React.FC<AnnotatedPDFViewerProps> = ({ fileUrl, annotationsData }) => {
  

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const webViewerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && viewerRef.current) {
      WebViewer(
        {
          path: '/lib',
          licenseKey: 'demo:1726216468861:7e284aa90300000000d4e7c6a09995eaa9f796cfe5f51f725e1f67836a',
          initialDoc: fileUrl,
        },
        viewerRef.current
      ).then((instance) => {
        webViewerInstanceRef.current = instance;
        const { annotationManager } = instance.Core;

        // Load annotations on the PDF
        annotationsData.forEach((annotation) => {
          const { type, coordinates, pageNumber, color } = annotation;
          let newAnnotation;

          switch (type) {
            case 'Rectangle':
              newAnnotation = new instance.Core.Annotations.RectangleAnnotation();
              break;
            case 'Polygon':
              newAnnotation = new instance.Core.Annotations.PolygonAnnotation();
              break;
            // Add more cases as needed
            default:
              newAnnotation = new instance.Core.Annotations.Annotation();
          }

          newAnnotation.setRect(coordinates);
          newAnnotation.PageNumber = pageNumber;
          

          annotationManager.addAnnotation(newAnnotation);
        });

        annotationManager.drawAnnotationsFromList(annotationManager.getAnnotationsList());
      }).catch((error) => {
        console.error('Error initializing WebViewer:', error);
      });
    }
    
  
  console.log(annotationsData) ;

    return () => {
      if (webViewerInstanceRef.current) {
        const { Core } = webViewerInstanceRef.current;
        if (Core.documentViewer) {
          Core.documentViewer.closeDocument();
        }
        webViewerInstanceRef.current = null;
      }
    };
  }, [fileUrl, annotationsData]);
  if(annotationsData.length === 0){
    return <div>No annotations to display</div>;
}
  return (
    <div ref={viewerRef} style={{ height: '100vh', width: '100%' }} />
  );
};

export default AnnotatedPDFViewer;
