import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '/src/components/ui/card.jsx';
import { Input } from '/src/components/ui/input.jsx';
import { Label } from '/src/components/ui/label.jsx';
import { Button } from '/src/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/src/components/ui/select.jsx';

const AnnotationMenu = ({ position, onSubmit, onCancel }) => {
  const [type, setType] = useState('');
  const [marks, setMarks] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !marks) return;

    onSubmit({
      type,
      marks: parseFloat(marks),
      comments
    });

    
    setType('');
    setMarks('');
    setComments('');
  };

  return (
    <Card 
      className="absolute z-50 w-80"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x + position.width + 10}px`
      }}
    >
      <CardHeader>
        <CardTitle>Annotation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="answer">Answer</SelectItem>
                <SelectItem value="partial">Partial Answer</SelectItem>
                <SelectItem value="incorrect">Incorrect Answer</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marks</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="Enter marks"
            />
          </div>

          <div className="space-y-2">
            <Label>Comments</Label>
            <Input
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments (optional)"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!type || !marks}>
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnnotationMenu;