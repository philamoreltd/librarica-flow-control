import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Department = Tables<'departments'>;

interface DepartmentInput {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error loading departments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (departmentData: DepartmentInput) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([departmentData])
        .select()
        .single();

      if (error) throw error;

      // If email is provided, create department admin account
      if (departmentData.email && data) {
        try {
          const { error: adminError } = await supabase.functions.invoke('create-department-admin', {
            body: {
              email: departmentData.email,
              departmentId: data.id,
              departmentName: data.name
            }
          });

          if (adminError) {
            console.error('Error creating department admin:', adminError);
            toast({
              title: "Department created",
              description: "Department created, but failed to send invitation email.",
              variant: "default",
            });
          } else {
            toast({
              title: "Department created",
              description: `Department created and invitation email sent to ${departmentData.email}`,
            });
          }
        } catch (adminError) {
          console.error('Error calling create-department-admin function:', adminError);
          toast({
            title: "Department created",
            description: "Department created, but failed to send invitation email.",
          });
        }
      } else {
        toast({
          title: "Department created",
          description: "The department has been created successfully.",
        });
      }

      fetchDepartments();
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast({
        title: "Error creating department",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Department updated",
        description: "The department has been updated successfully.",
      });

      fetchDepartments();
    } catch (error: any) {
      console.error('Error updating department:', error);
      toast({
        title: "Error updating department",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
      });

      fetchDepartments();
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error deleting department",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDepartments();

    const channel = supabase
      .channel('departments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departments'
        },
        () => {
          fetchDepartments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const resendInvitation = async (departmentId: string, email: string, departmentName: string) => {
    try {
      const { error } = await supabase.functions.invoke('create-department-admin', {
        body: {
          email,
          departmentId,
          departmentName
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Password setup email resent to ${email}`,
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error resending invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    departments,
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    resendInvitation,
    refetch: fetchDepartments,
  };
}
