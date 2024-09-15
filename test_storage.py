import uuid
from presentation_storage import save_presentation, get_presentation, list_presentations, delete_presentation

def test_storage():
    # Test saving a presentation
    presentation_id = str(uuid.uuid4())
    test_presentation = {
        "title": "Test Presentation",
        "slides": [
            {"type": "text", "content": "Slide 1"},
            {"type": "image", "content": "image_url.jpg"}
        ]
    }
    save_presentation(presentation_id, test_presentation)
    print(f"Saved presentation with ID: {presentation_id}")

    # Test retrieving a presentation
    retrieved_presentation = get_presentation(presentation_id)
    print(f"Retrieved presentation: {retrieved_presentation}")

    # Test listing presentations
    presentations_list = list_presentations()
    print(f"List of presentations: {presentations_list}")

    # Test deleting a presentation
    delete_result = delete_presentation(presentation_id)
    print(f"Deleted presentation: {delete_result}")

    # Verify deletion
    deleted_presentation = get_presentation(presentation_id)
    print(f"Attempting to retrieve deleted presentation: {deleted_presentation}")

if __name__ == "__main__":
    test_storage()
