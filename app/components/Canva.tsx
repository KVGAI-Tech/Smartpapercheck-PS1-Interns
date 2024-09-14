'use client';

import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button'; // Assume Input is from your UI library
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react'; // Assuming you're using Lucide icons

interface PDFViewerProps {
  fileUrl: string; // URL of the PDF file to load
  onAnnotationsUpdated?: (annotations: any) => void;
  courseTitle: string;
  examName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onAnnotationsUpdated, courseTitle, examName }) => {
  console.log(courseTitle , examName )
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const webViewerInstanceRef = useRef<any>(null);
  const [annotationsData, setAnnotationsData] = useState<any[]>([]); // Store all annotations info
  const [selectedAnnotation, setSelectedAnnotation] = useState<any | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [annotatedPdfUrl, setAnnotatedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (viewerRef.current) {
      if (webViewerInstanceRef.current) {
        console.warn('WebViewer instance already created.');
        return;
      }

      WebViewer(
        {
          path: '/lib', 
          licenseKey: 'demo:1726216468861:7e284aa90300000000d4e7c6a09995eaa9f796cfe5f51f725e1f67836a',
          initialDoc: fileUrl,
        },
        viewerRef.current
      ).then((instance) => {
        webViewerInstanceRef.current = instance;
        const { documentViewer, annotationManager } = instance.Core;

        // Listen for annotation changes (detect when a shape is created)
        annotationManager.addEventListener('annotationChanged', (annotations, action) => {
          if (action === 'add') {
            const newAnnotation = annotations[0];
            if (newAnnotation.Subject === 'Rectangle' || newAnnotation.Subject === 'Polygon') {
              const rect = newAnnotation.getRect();
              // Show options menu near the drawn shape
              const x = rect.x1;
              const y = rect.y1;
              setMenuPosition({ x, y });
              setSelectedAnnotation(newAnnotation);
            }
          }
        });
      }).catch((error) => {
        console.error('Error initializing WebViewer:', error);
      });
    }

    return () => {
      if (webViewerInstanceRef.current) {
        const { Core } = webViewerInstanceRef.current;
        if (Core.documentViewer) {
          Core.documentViewer.closeDocument();
        }
        webViewerInstanceRef.current = null;
      }
    };
  }, [fileUrl]);

  // const exportAndGeneratePdfUrl = async () => {

  //   const { documentViewer } = webViewerInstanceRef.current.Core;
  //   console.log(documentViewer.getDocument())
  //   const pdfDoc = await documentViewer.getDocument().getPDFDoc();
  //   console.log("pdfDoc",pdfDoc)
  //   const pdfBytes = await pdfDoc.save();
  //   console.log("pdfBytes",pdfBytes)
  //   const file = new File([pdfBytes], 'annotated.pdf', { type: 'application/pdf' });
  //   console.log("file",file)
  //   const reader = new FileReader();
  //   console.log("reader",reader)

  //   return new Promise<string | undefined>((resolve, reject) => {
  //     reader.onloadend = () => {
  //       try {
  //         const base64PDF = reader.result as string;
  //         resolve(base64PDF); // Return the base64-encoded data URL
  //       } catch (error) {
  //         console.error('Error generating PDF URL:', error);
  //         reject(error);
  //       }
  //     };

  //     reader.readAsDataURL(file); // Convert file to data URL
  //   });
  // };

  const handleSaveAnnotations = async () => {
    setIsSaving(true);
  try {
    if(!webViewerInstanceRef.current) return;
      if (webViewerInstanceRef.current) {
        const { documentViewer, annotationManager } = webViewerInstanceRef.current.Core;
        const doc = documentViewer.getDocument();
        const xfdfString = await annotationManager.exportAnnotations();
        const data = await doc.getFileData({
          xfdfString,
          flags: webViewerInstanceRef.current.Core.SaveOptions.LINEARIZED,
          downloadType: 'pdf',
        });
  
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAnnotatedPdfUrl(base64data);
          console.log('Annotated PDF URL:', base64data);
  
          // Store the PDF URL with course title
          const courseData = {
            title: courseTitle,
            pdfUrl: base64data,
            examName: examName,
          };
  
          console.log('Course Data:', courseData);
          // You can store or use this courseData object as needed
        };
  
        reader.readAsDataURL(new Blob([data]));
      }
  } catch (error) {
    console.error('Error saving annotations:', error);
  } finally {
    setIsSaving(false);
  }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedAnnotation) {
      const annotationID = selectedAnnotation.Id;
      const rect = selectedAnnotation.getRect();
      const pageNumber = selectedAnnotation.PageNumber;
      const annotationType = option;

      // Create object to store annotation data
      const annotationData = {
        id: annotationID,
        type: annotationType,
        coordinates: {
          x1: rect.x1,
          y1: rect.y1,
          x2: rect.x2,
          y2: rect.y2
        },
        pageNumber
      };

      // Add this annotation data to the collective state
      setAnnotationsData((prevAnnotations) => [...prevAnnotations, annotationData]);

      console.log('Annotation data collected:', annotationData);

      // Clear selected annotation and hide menu
      setMenuPosition(null);
      setSelectedAnnotation(null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={viewerRef} style={{ height: '100vh', width: '100%' }} />

      {menuPosition && (
        <div
          className="annotation-menu"
          style={{
            position: 'absolute',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            background: 'white',
            border: '1px solid black',
            zIndex: 1000,
            padding: '10px',
          }}
        >
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger asChild>
              <Button>Select Annotation Type</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleOptionSelect('Figure')}>Figure</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOptionSelect('Graph')}>Graph</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOptionSelect('Text')}>Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOptionSelect('Answer')}>Answer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
       
        <Button className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25' onClick={handleSaveAnnotations}>{isSaving ? <Loader2 className='animate-spin' /> : <Save className='w-4 h-4' />}Save annotation</Button>
      </div>

      {/* Show annotated PDF URL if available */}
      {annotatedPdfUrl && (
        <div style={{ position: 'fixed', bottom: '50px', right: '10px' }}>
          <a href={annotatedPdfUrl} target="_blank" rel="noopener noreferrer">View Annotated PDF</a>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
