# components.py
from fasthtml.common import *
import random

class UIComponents:
    """Reusable UI components for the Sondr app"""
    
    @staticmethod
    def container(*children, **kwargs):
        """Main container for page content with consistent padding and max-width"""
        return Div(
            *children,
            cls="container",
            **kwargs
        )
    
    @staticmethod
    def card(*children, cls="", **kwargs):
        """Reusable card component with glass morphism styling"""
        return Div(
            *children,
            cls=f"card {cls}",
            **kwargs
        )
    
    @staticmethod
    def button(text, primary=True, disabled=False, href=None, **kwargs):
        """Styled button component - can be a button or link"""
        btn_class = "btn-primary" if primary else "btn-secondary"
        if disabled:
            btn_class += " disabled"
        
        if href:
            return A(
                text,
                href=href,
                cls=btn_class,
                **kwargs
            )
        else:
            return Button(
                text,
                cls=btn_class,
                disabled=disabled,
                **kwargs
            )
    
    @staticmethod
    def prompt_card(todays_prompt, prompt_index, total_prompts):
        """Today's writing prompt displayed prominently"""
        return UIComponents.card(
            H3("📝 Today's Writing Prompt", cls="prompt-card-title"),
            P(todays_prompt, cls="prompt-text"),
            P(
                f"Prompt #{prompt_index + 1} of {total_prompts}", 
                cls="prompt-index"
            ),
            cls="prompt-card"
        )
    
    @staticmethod
    def post_card(post, WRITING_PROMPTS, show_prompt=True, is_anonymous=True):
        """Display a single post with optional prompt and user info"""
        return Div(
            # Show which prompt this post responds to (optional)
            (P(
                f"📝 {WRITING_PROMPTS[post['prompt_index']]}", 
                cls="post-prompt"
            ) if show_prompt else None),
            
            # Post content
            P(post['content'], cls="post-content"),
            
            # Image if present
            (Div(
                Img(
                    src=f"/image/{post['id']}", 
                    cls="post-image",
                    onerror="this.style.display='none'; this.parentNode.innerHTML='<p class=\\'image-error\\'>📷 Image could not be displayed</p>';"
                )
            ) if post.get('image') else None),
            
            # Timestamp (anonymous or with user info)
            P(
                f"{'Posted today at ' if is_anonymous else 'Posted: '}{post['created_at'][11:16] if is_anonymous else f'{post['created_at'][:10]} at {post['created_at'][11:16]}'}",
                cls="post-timestamp"
            ),
            
            cls="post"
        )
    
    @staticmethod
    def gallery(posts, WRITING_PROMPTS, title="Today's Gallery", empty_message="🌟 Be the first to respond today!"):
        """Gallery component for displaying multiple posts"""
        shuffled_posts = list(posts)
        if posts:
            random.shuffle(shuffled_posts)
        
        return Div(
            H2(f'📸 {title}', cls="gallery-title"),
            P(
                f"{len(posts)} response{'' if len(posts) == 1 else 's'} so far today", 
                cls="gallery-count"
            ) if title == "Today's Gallery" else None,
            
            # Display posts or empty state
            *[UIComponents.post_card(post, WRITING_PROMPTS, show_prompt=True, is_anonymous=True) 
              for post in shuffled_posts] if posts else 
            Div(
                P(empty_message, cls="empty-message"),
                cls="empty-state"
            ),
            
            cls="gallery"
        )
    
    @staticmethod
    def post_form(todays_prompt, action="/create-post"):
        """Form for creating a new post"""
        return Div(
            H2('Create a Post', cls="form-title"),
            P(
                f"Respond to: {todays_prompt}", 
                cls="prompt-response-label"
            ),
            Form(
                Textarea(
                    name="content", 
                    placeholder="Write your response here...", 
                    rows=6, 
                    cols=50, 
                    required=True,
                    cls="post-textarea"
                ),
                Input(
                    type="file", 
                    name="image", 
                    accept=".jpg,.jpeg,.heic,.heif,.png",
                    cls="file-input"
                ),
                UIComponents.image_upload_hint(),
                UIComponents.button('Submit Post', primary=True),
                method="post", 
                action=action,
                enctype="multipart/form-data",
                cls="form-container"
            )
        )
    
    @staticmethod
    def auth_card(title, form_action, confirm_password=False):
        """Authentication card for login or registration"""
        form_fields = [
            Input(name="email", type="email", placeholder="Email", required=True, cls="auth-input"),
            Input(name="password", type="password", placeholder="Password", required=True, cls="auth-input"),
        ]
        
        if confirm_password:
            form_fields.append(
                Input(name="confirm_password", type="password", placeholder="Confirm Password", required=True, cls="auth-input")
            )
        
        return Div(
            H2(title, cls="auth-card-title"),
            Form(
                *form_fields,
                UIComponents.button(title, primary=True),
                method="post",
                action=form_action,
                cls="auth-form"
            ),
            cls="auth-card"
        )
    
    @staticmethod
    def status_message(message, type="info"):
        """Status message banner (success, error, info)"""
        type_map = {
            "success": "status-success",
            "error": "status-error",
            "info": "status-info",
            "warning": "status-warning"
        }
        return Div(
            P(message, cls="status-message"),
            cls=f"status-badge {type_map.get(type, 'status-info')}"
        )
    
    @staticmethod
    def empty_state(message, icon="🌟"):
        """Empty state display for when there's no content"""
        return Div(
            P(f"{icon} {message}", cls="empty-message"),
            cls="empty-state"
        )
    
    @staticmethod
    def image_upload_hint():
        """Helper text for image uploads"""
        return Div(
            P("📸 Image tips:", cls="hint-title"),
            Ul(
                Li("JPEG, PNG, and HEIC (iPhone) formats supported"),
                Li("Maximum file size: 5MB"),
                Li("Images will be automatically resized to 800x800"),
                Li("HEIC files will be converted to JPEG"),
                cls="hint-list"
            ),
            cls="file-input-hint"
        )
    
    @staticmethod
    def recent_posts_section(posts, WRITING_PROMPTS, limit=5):
        """Section showing user's recent posts"""
        limited_posts = posts[:limit] if posts else []
        
        return Div(
            H2('Your Recent Posts', cls="section-title"),
            *[UIComponents.post_card(post, WRITING_PROMPTS, show_prompt=True, is_anonymous=False) 
              for post in limited_posts] if limited_posts else 
            UIComponents.empty_state("No posts yet. Make your first post above!", "✍️"),
            (P(f"And {len(posts) - limit} more...", cls="more-posts-hint") 
             if posts and len(posts) > limit else None),
            cls="recent-posts"
        )
    
    @staticmethod
    def error_page(title, message, error_details=None, return_url="/"):
        """Error page display"""
        content = [
            H1(title, cls="error-title"),
            P(message, cls="error-message"),
        ]
        
        if error_details:
            content.append(
                P(error_details, cls="error-details")
            )
        
        content.append(UIComponents.button("Go Back", primary=True, href=return_url))
        
        return UIComponents.container(
            UIComponents.card(*content, cls="error-card")
        )
    
    @staticmethod
    def today_preview(prompt, post_count):
        """Preview section for non-logged-in users"""
        return UIComponents.card(
            H3("Today on Sondr", cls="preview-title"),
            P("📝 Today's prompt:", cls="preview-label"),
            P(prompt, cls="preview-prompt"),
            P(f"👥 {post_count} response{'' if post_count == 1 else 's'} so far", 
              cls="preview-count"),
            P("Login or register to join the conversation →", 
              cls="preview-cta"),
            cls="preview-card"
        )
