import logging
from django.utils import timezone
from .models import Article

logger = logging.getLogger(__name__)

class ArticleService:
    @staticmethod
    def create_article(data, author):
        """
        Creates a new news article.
        """
        article = Article.objects.create(
            author=author,
            **data
        )
        logger.info(f"Article created: {article.title} by {author.username}")
        return article

    @staticmethod
    def update_article(article_id, data):
        """
        Updates an existing article.
        """
        article = Article.objects.get(id=article_id)
        for key, value in data.items():
            setattr(article, key, value)
        article.save()
        logger.info(f"Article updated: {article.title}")
        return article
