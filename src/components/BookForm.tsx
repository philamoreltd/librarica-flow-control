import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";

interface BookFormData {
  title: string;
  author: string;
  category: string;
  isbn: string;
  description: string;
  grade_level: string;
  points: string;
  total_copies: string;
  available_copies: string;
  cover_image: string;
  qrCode: string;
  featured: boolean;
  department_id?: string;
}

interface BookFormProps {
  formData: BookFormData;
  onFormDataChange: (data: BookFormData) => void;
  onSubmit: () => void;
  submitLabel: string;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export const BookForm = ({ formData, onFormDataChange, onSubmit, submitLabel, categories, onAddCategory }: BookFormProps) => {
  const [customCategory, setCustomCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const { departments } = useDepartments();
  
  const gradeLevels = ["Grade 10", "Form 2", "Form 3", "Form 4"];

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]);

  const handleTotalCopiesChange = useCallback((value: string) => {
    const total = value;
    onFormDataChange({ 
      ...formData, 
      total_copies: total,
      available_copies: formData.available_copies > total ? total : formData.available_copies
    });
  }, [formData, onFormDataChange]);

  const addCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      onAddCategory(customCategory.trim());
      setCustomCategory("");
      setShowAddCategory(false);
      handleInputChange('category', customCategory.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="department_id">Department (Optional)</Label>
        <Select value={formData.department_id || "none"} onValueChange={(value) => handleInputChange('department_id', value === "none" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Department</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <div className="space-y-2">
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {!showAddCategory ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCategory(true)}
                className="w-full"
              >
                Add New Subject
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new subject"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addCustomCategory}
                  disabled={!customCategory.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddCategory(false);
                    setCustomCategory("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="grade_level">Grade Level</Label>
          <Select value={formData.grade_level} onValueChange={(value) => handleInputChange('grade_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeLevels.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Book title"
            required
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={(e) => handleInputChange('isbn', e.target.value)}
            placeholder="ISBN number"
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          name="author"
          value={formData.author}
          onChange={(e) => handleInputChange('author', e.target.value)}
          placeholder="Author name"
          required
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            name="points"
            type="number"
            value={formData.points}
            onChange={(e) => handleInputChange('points', e.target.value)}
            min="1"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="total_copies">Total Copies</Label>
          <Input
            id="total_copies"
            name="total_copies"
            type="number"
            value={formData.total_copies}
            onChange={(e) => handleTotalCopiesChange(e.target.value)}
            min="1"
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Book description"
          rows={3}
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="cover_image">Cover Image URL</Label>
        <Input
          id="cover_image"
          name="cover_image"
          value={formData.cover_image}
          onChange={(e) => handleInputChange('cover_image', e.target.value)}
          placeholder="https://example.com/cover.jpg"
          autoComplete="off"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured}
          onChange={(e) => handleInputChange('featured', e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="featured">Mark as Featured Book</Label>
      </div>

      <Button type="button" onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
};