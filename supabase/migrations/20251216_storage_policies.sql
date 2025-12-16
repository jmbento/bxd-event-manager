-- ========================================
-- POLÍTICAS DE STORAGE - BXD EVENT MANAGER
-- ========================================
-- Execute este SQL no Supabase SQL Editor (Dashboard → SQL Editor)

-- ============================================
-- BUCKET: documents (Público)
-- ============================================

-- Qualquer pessoa pode VER/BAIXAR documentos
CREATE POLICY "documents_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Apenas usuários autenticados podem FAZER UPLOAD
CREATE POLICY "documents_authenticated_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem ATUALIZAR
CREATE POLICY "documents_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem DELETAR
CREATE POLICY "documents_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- BUCKET: compliance-documents (Público)
-- ============================================

-- Qualquer pessoa pode VER/BAIXAR documentos de compliance
CREATE POLICY "compliance_documents_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'compliance-documents');

-- Apenas usuários autenticados podem FAZER UPLOAD
CREATE POLICY "compliance_documents_authenticated_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'compliance-documents' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem ATUALIZAR
CREATE POLICY "compliance_documents_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'compliance-documents' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem DELETAR
CREATE POLICY "compliance_documents_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'compliance-documents' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- CRIAR BUCKET: meeting-recordings (Privado)
-- ============================================

-- Criar bucket para gravações de reuniões (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-recordings', 'meeting-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: meeting-recordings (Privado)
-- ============================================

-- Apenas usuários autenticados podem VER/BAIXAR suas gravações
CREATE POLICY "meeting_recordings_authenticated_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'meeting-recordings' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem FAZER UPLOAD
CREATE POLICY "meeting_recordings_authenticated_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meeting-recordings' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem ATUALIZAR
CREATE POLICY "meeting_recordings_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'meeting-recordings' 
  AND auth.role() = 'authenticated'
);

-- Apenas usuários autenticados podem DELETAR
CREATE POLICY "meeting_recordings_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'meeting-recordings' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;

-- Verificar buckets
SELECT id, name, public FROM storage.buckets;
