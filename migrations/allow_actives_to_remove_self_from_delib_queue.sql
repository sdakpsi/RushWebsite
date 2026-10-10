-- Run in the Supabase SQL Editor for existing installations.
-- Self-removal completes an entry; it does not delete it.
BEGIN;

DROP POLICY IF EXISTS "Actives can complete their own queue entries" ON public.delib_queue;
CREATE POLICY "Actives can complete their own queue entries" ON public.delib_queue
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        AND status IN ('pending', 'speaking')
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_active = true
        )
    )
    WITH CHECK (
        user_id = auth.uid()
        AND status = 'completed'
        AND completed_at IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_active = true
        )
    );

COMMIT;
