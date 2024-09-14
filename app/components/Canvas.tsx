import React, { useState, useRef } from 'react';
import { Stage, Layer, Image, Circle, Line } from 'react-konva';
import useImage from 'use-image';

const ImageEditor: React.FC = () => {
  const [image] = useImage('');
  const [uploadedImage, setUploadedImage] = useState<string | undefined>();
  const [tool, setTool] = useState<'circle' | 'polygon' | null>(null);
  const [shapes, setShapes] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<number[]>([]);

  const stageRef = useRef<any>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: any) => {
    if (!tool) return;

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    if (tool === 'circle') {
      setShapes([...shapes, { tool, x: pos.x, y: pos.y, radius: 0 }]);
    } else if (tool === 'polygon') {
      setPoints([...points, pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (tool === 'circle') {
      const lastCircle = shapes[shapes.length - 1];
      const newRadius = Math.sqrt(
        Math.pow(point.x - lastCircle.x, 2) + Math.pow(point.y - lastCircle.y, 2)
      );
      const updatedShapes = shapes.slice(0, -1).concat({
        ...lastCircle,
        radius: newRadius,
      });
      setShapes(updatedShapes);
    } else if (tool === 'polygon') {
      setPoints([...points, point.x, point.y]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (tool === 'polygon') {
      setShapes([...shapes, { tool, points: points }]);
      setPoints([]);
    }
  };

  return (
    <div className="p-4">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
      <div className="mb-4">
        <button
          onClick={() => setTool('circle')}
          className={`mr-2 px-4 py-2 ${tool === 'circle' ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          Circle
        </button>
        <button
          onClick={() => setTool('polygon')}
          className={`px-4 py-2 ${tool === 'polygon' ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          Polygon
        </button>
      </div>
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{ border: '1px solid black' }}
      >
        <Layer>
          {uploadedImage && <Image image={image} />}
          {shapes.map((shape, i) => {
            if (shape.tool === 'circle') {
              return <Circle key={i} x={shape.x} y={shape.y} radius={shape.radius} stroke="red" />;
            } else if (shape.tool === 'polygon') {
              return <Line key={i} points={shape.points} stroke="blue" closed />;
            }
            return null;
          })}
          {tool === 'polygon' && <Line points={points} stroke="blue" />}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageEditor;