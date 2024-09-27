'use client'

import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button'; // Assume Input is from your UI library
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react'; // Assuming you're using Lucide icons
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroupItem  ,  RadioGroup } from '@/components/ui/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import AnnotatedPDFViewer from './DiaplayingAnnotation';

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
  const [keyword, setKeyword] = useState('');
  const [marks, setMarks] = useState('');
  const [markingType, setMarkingType] = useState('full');
  const[savedannotation , setsavedannotation] = useState(false) ;

  const [annotationType, setAnnotationType] = useState('');
 const [overlayOpacity, setOverlayOpacity] = useState(0);
 const [showannotatedPdf,setShowAnnotatedPDF] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && viewerRef.current) {
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
        const { documentViewer, annotationManager , Annotations } = instance.Core;
  
        annotationManager.addEventListener('annotationChanged', (annotations, action) => {
          if (action === 'add') {
            const newAnnotation = annotations[0];
            if (newAnnotation.Subject === 'Rectangle' || newAnnotation.Subject === 'Polygon') {
             const  strokeColor = newAnnotation.StrokeColor;
            
              // Set the fill color to the stroke color and adjust opacity
              newAnnotation.FillColor = new Annotations.Color(
                strokeColor.R, 
                strokeColor.G, 
                strokeColor.B, 
                0.1 // Set opacity to 50%
              );
              
              // Force the annotation to redraw with the new appearance
              annotationManager.redrawAnnotation(newAnnotation);
              const rect = newAnnotation.getRect();
              const x = rect.x1;
              const y = rect.y1;
              setMenuPosition({ x, y });
              setSelectedAnnotation(newAnnotation);
              setOverlayOpacity(0.5);
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
   const handleDeleteAnnotation = () => {
    if (selectedAnnotation) {
      if (!webViewerInstanceRef.current) return;

      const { annotationManager } = webViewerInstanceRef.current.Core;
      annotationManager.deleteAnnotation(selectedAnnotation);

      // Optionally remove the annotation from your state
      setAnnotationsData(prevAnnotations =>
        prevAnnotations.filter(annotation => annotation.id !== selectedAnnotation.Id)
      );

      setMenuPosition(null);
      setSelectedAnnotation(null);
      setOverlayOpacity(0); // Close overlay after deletion
    }
  };  
  useEffect(()=>{
    console.log(showannotatedPdf)
  } , [showannotatedPdf , setShowAnnotatedPDF])
  const handleViewAnnotatedPDF = () => {
    if (annotatedPdfUrl) {
      // Create an anchor element and simulate a click to download the PDF
      const link = document.createElement('a');
      link.href = annotatedPdfUrl;
      link.download = `${courseTitle}-${examName}-Annotated.pdf`;
      link.click();
    }
  };
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
    setsavedannotation(true) ;
  }
  };

  const handleOptionSelect = () => {
    setOverlayOpacity(0);
    if (selectedAnnotation) {
      const annotationID = selectedAnnotation.Id;
      const rect = selectedAnnotation.getRect();
      const pageNumber = selectedAnnotation.PageNumber;
      const color = selectedAnnotation.StrokeColor;
      console.log("this is color",color)

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
        pageNumber,
        keyword,
        marks: parseFloat(marks),
        markingType ,
        color: {
          r: color.R,
          g: color.G,
          b: color.B,
          a: color.A
        }

      };

      // Add this annotation data to the collective state
      setAnnotationsData((prevAnnotations) => [...prevAnnotations, annotationData]);

      console.log('Annotation data collected:', annotationData);

      // Clear selected annotation and hide menu
      setMenuPosition(null);
      setSelectedAnnotation(null);
      setKeyword('');
      setMarks('');
      setMarkingType('full');
      setAnnotationType('');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={viewerRef} style={{ height: '100vh', width: '100%' }} />
 <AnimatePresence>
        {menuPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
              pointerEvents: 'none',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>
      {menuPosition && (
        <Card className="absolute z-50" style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, width: '300px' }}>
          <CardHeader>
            <CardTitle className='text-lg font-semibold text-primary-600'>Annotation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="annotationType">Annotation Type</Label>
              <Select onValueChange={setAnnotationType} value={annotationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Figure">Figure</SelectItem>
                  <SelectItem value="Graph">Graph</SelectItem>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Answer">Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="Enter marks"
              />
            </div>
            <div className="space-y-2">
              <Label>Marking Type</Label>
              <RadioGroup defaultValue="full" onValueChange={setMarkingType}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="full" id="full" />
    <Label htmlFor="full">Full Marking</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="partial" id="partial" />
    <Label htmlFor="partial">Partial Marking</Label>
  </div>
</RadioGroup>

            </div>
            <Button onClick={handleOptionSelect} className="w-full bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25">
              Save Annotation
            </Button>
          </CardContent>
        </Card>
      )}

      <div style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
        <Button  className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25'onClick={handleSaveAnnotations} >
          {isSaving ? <Loader2 className='animate-spin' /> : <Save className='w-4 h-4' />}
          Save annotation
        </Button>
      </div>

      { 
      savedannotation && 
       (
        <div style={{ position: 'fixed', bottom: '50px', right: '10px' }}>

          <Button onClick={handleViewAnnotatedPDF}  rel="noopener noreferrer">View Annotated PDF</Button>
        </div>
      )} 
      {showannotatedPdf && (
        <AnnotatedPDFViewer fileUrl={annotatedPdfUrl!} annotationsData={annotationsData} />
      )}
    </div>
  );
};

export default PDFViewer;
