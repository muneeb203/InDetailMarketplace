import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { StickyNote, Edit3, Save, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface RelationshipNotesProps {
  clientId: string;
  clientName: string;
  existingNotes?: string;
  onSave: (notes: string) => void;
}

export function RelationshipNotes({ 
  clientId, 
  clientName, 
  existingNotes = '',
  onSave 
}: RelationshipNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(existingNotes);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = () => {
    onSave(notes);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    toast.success('Private notes saved');
  };

  const handleCancel = () => {
    setNotes(existingNotes);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasUnsavedChanges(value !== existingNotes);
  };

  return (
    <Card className="p-4 border border-purple-200 bg-purple-50/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
            <StickyNote className="w-3 h-3 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm">Private Notes</h3>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Only you can see these notes
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-purple-300 text-purple-600 hover:bg-purple-100"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            {existingNotes ? 'Edit' : 'Add'}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={`Private notes about ${clientName}...\n\nExamples:\n• Name pronunciation: "MARE-ee-ah"\n• Prefers eco-friendly products\n• Extra careful with leather seats\n• Loves peppermint scent`}
              rows={6}
              className="text-sm resize-none focus:ring-purple-500 focus:border-purple-500"
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={!hasUnsavedChanges}
                className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-3 h-3 mr-1" />
                Save Notes
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {existingNotes ? (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingNotes}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <StickyNote className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-xs text-gray-600">
                  Add private notes to remember preferences, name pronunciation, or special requests
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Badge */}
      {existingNotes && !isEditing && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
            <Lock className="w-2.5 h-2.5 mr-1" />
            You added a private note
          </Badge>
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 italic">
          Use notes for: name pronunciation, product preferences, vehicle quirks, or communication style
        </p>
      </div>
    </Card>
  );
}
