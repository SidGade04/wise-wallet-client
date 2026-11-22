import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/useAuth';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  has_connected_bank: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data as Profile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') return false; // No rows returned
      return failureCount < 3;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      // Also invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  const refreshProfile = () => {
    return queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  return {
    ...query,
    updateProfile,
    refreshProfile
  };
}
