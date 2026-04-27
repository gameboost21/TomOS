from sqlmodel import Session, select, delete
from fastapi import HTTPException, Response
from datetime import datetime, timezone

from domains.knowledge.models.knowledge_models import Articles, ArticleTag
from domains.knowledge.schemas.knowledge_schemas import ArticleCreate, ArticleUpdate
from domains.users.models.user_models import Users

def create_article(article_schema: ArticleCreate, session: Session, user: Users) -> Articles:
    article_model = Articles(**article_schema.model_dump(), owner_id=user.id)
    
    session.add(article_model)
    session.commit()
    session.refresh(article_model)

    for tag_id in (article_schema.tags or []):
        article_tag = ArticleTag(article_id=article_model.id, tag_id = tag_id)
        session.add(article_tag)

    session.commit()
    session.refresh(article_model)

    return article_model

def get_all_articles(session: Session, user: Users):
    
    statement = select(Articles).where(Articles.owner_id == user.id)
    articles = session.exec(statement).all()
    return articles

def get_article_by_id(id: int, session: Session):
    
    statement = select(Articles).where(Articles.id == id)
    article = session.exec(statement).one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return article

def delete_article(id: int, session: Session):
    statement = select(Articles).where(Articles.id == id)
    article = session.exec(statement).one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    session.delete(article)
    session.commit()
 
    return Response(status_code=204)

    

def update_article(id: int, article_schema: ArticleUpdate, session: Session, user: Users) -> Articles:

    updates = article_schema.model_dump(exclude_unset=True, exclude={"tags"})
    
    statement = select(Articles).where(Articles.id == id, Articles.owner_id == user.id)
    article = session.exec(statement).one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    for field, value in updates.items():
        setattr(article, field, value)

    article.updated_at = datetime.now(timezone.utc)

    if article_schema.tags is not None:
        session.exec(
            delete(ArticleTag).where(ArticleTag.article_id == id)
        )

        for tag_id in article_schema.tags:
            session.add(ArticleTag(article_id=id, tag_id=tag_id))

    session.commit()
    session.refresh(article)
    return article
    
