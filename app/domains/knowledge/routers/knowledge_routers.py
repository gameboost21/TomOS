from fastapi import APIRouter, Depends
from core.database.session import get_session
from sqlmodel import Session

from domains.knowledge.models.knowledge_models import Articles, Category, Tag, ArticleTag, Attachment
from domains.users.models.user_models import Users

from domains.knowledge.services.knowledge_services import create_article as create_article_service
from domains.knowledge.services.knowledge_services import get_all_articles as get_all_articles_service
from domains.knowledge.services.knowledge_services import get_article_by_id as get_article_by_id_service
from domains.knowledge.services.knowledge_services import delete_article as delete_article_service
from domains.knowledge.services.knowledge_services import update_article as update_article_service


from domains.users.services.user_service import require_admin as admin
from domains.users.services.user_service import require_moderator as mod
from domains.users.services.user_service import require_super_user as su
from domains.users.services.user_service import require_viewer as viewer

from domains.knowledge.schemas.knowledge_schemas import ArticleCreate, ArticleUpdate

router = APIRouter()

@router.post("/knowledge")
def create_article_endpoint(article_schema: ArticleCreate, user: Users = Depends(viewer), session: Session = Depends(get_session)):
    return create_article_service(article_schema, session, user)

@router.get("/knowledge")
def get_all_articles_endpoint(user: Users = Depends(viewer), session: Session = Depends(get_session)):
    return get_all_articles_service(session, user)

@router.get("/knowledge/{id}")
def get_article_by_id_endpoint(id: int, _: Users = Depends(viewer), session: Session = Depends(get_session)):
    return get_article_by_id_service(id, session)

@router.delete("/knowledge/{id}", status_code=204)
def delete_article_endpoint(id: int, _: Users = Depends(su), session: Session = Depends(get_session)):
    return delete_article_service(id, session)

@router.put("/knowledge/{id}")
def update_article_endpoint(id: int, article_schema: ArticleUpdate, _: Users = Depends(viewer), session: Session = Depends(get_session)):
    return update_article_service(id, article_schema, Session)