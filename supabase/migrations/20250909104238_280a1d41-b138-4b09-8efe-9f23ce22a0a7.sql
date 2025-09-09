-- Update existing book copies without ISBN to have sequential ISBNs
DO $$
DECLARE
    copy_record RECORD;
    generated_isbn TEXT;
BEGIN
    -- Loop through all book copies that don't have ISBN
    FOR copy_record IN 
        SELECT bc.id, bc.book_id 
        FROM book_copies bc 
        WHERE bc.isbn IS NULL OR bc.isbn = ''
        ORDER BY bc.book_id, bc.copy_number
    LOOP
        -- Generate ISBN for this copy
        SELECT generate_copy_isbn(copy_record.book_id) INTO generated_isbn;
        
        -- Update the copy with the generated ISBN
        UPDATE book_copies 
        SET isbn = generated_isbn 
        WHERE id = copy_record.id;
    END LOOP;
END $$;