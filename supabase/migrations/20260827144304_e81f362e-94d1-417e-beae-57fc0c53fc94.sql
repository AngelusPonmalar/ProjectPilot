REVOKE ALL ON FUNCTION public.check_task_assignee() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_owner_membership() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM public, anon, authenticated;