import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface StudentFormProps {
  formData: {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    student_id: string;
    grade_level: string;
    points: string;
    password: string;
    institution: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    student_id: string;
    grade_level: string;
    points: string;
    password: string;
    institution: string;
  }>>;
  onSubmit: () => void;
  submitLabel: string;
  editingStudent?: any;
}

const gradeLevels = ["Grade 10", "Form 2", "Form 3", "Form 4"];

const StudentForm = ({ formData, setFormData, onSubmit, submitLabel, editingStudent }: StudentFormProps) => {
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            placeholder="First name"
            required
          />
        </div>
        <div>
          <Label htmlFor="middle_name">Middle Name</Label>
          <Input
            id="middle_name"
            value={formData.middle_name}
            onChange={(e) => handleInputChange('middle_name', e.target.value)}
            placeholder="Middle name"
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            placeholder="Last name"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="student@email.com (optional)"
          />
        </div>
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_id">Student Adm No *</Label>
          <Input
            id="student_id"
            value={formData.student_id}
            onChange={(e) => handleInputChange('student_id', e.target.value)}
            placeholder="Enter admission number"
            required
          />
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

      <div>
        <Label htmlFor="institution">Institution</Label>
        <Input
          id="institution"
          value={formData.institution}
          onChange={(e) => handleInputChange('institution', e.target.value)}
          placeholder="School/Institution name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) => handleInputChange('points', e.target.value)}
            min="0"
          />
        </div>
        {!editingStudent && (
          <div>
            <Label htmlFor="password">Password (leave empty for auto-generated)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Auto-generated if empty"
            />
          </div>
        )}
      </div>

      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
};

export default StudentForm;