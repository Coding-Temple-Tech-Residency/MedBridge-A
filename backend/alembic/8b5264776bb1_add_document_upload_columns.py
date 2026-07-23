"""add document upload columns

Revision ID: 8b5264776bb1
Revises: b51c187fbcc5
Create Date: 2026-07-11 16:18:44.990660

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8b5264776bb1'
down_revision: Union[str, Sequence[str], None] = 'b51c187fbcc5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # AI-205: document upload route needs to persist the original filename,
    # a resolved file_type (pdf/png/txt), and the Supabase Storage path.
    # Existing documents rows (if any) won't have these — batch_alter_table
    # with a server_default lets the ADD COLUMN succeed as NOT NULL even on
    # a non-empty table; the default only applies retroactively and new
    # rows always supply real values via DocumentRepository.create().
    with op.batch_alter_table('documents') as batch_op:
        batch_op.add_column(
            sa.Column('filename', sa.String(), nullable=False, server_default='')
        )
        batch_op.add_column(
            sa.Column('file_type', sa.String(), nullable=False, server_default='')
        )
        batch_op.add_column(
            sa.Column('storage_path', sa.String(), nullable=False, server_default='')
        )

    # Drop the server_default once existing rows are backfilled — new
    # inserts go through the ORM model, which always sets these explicitly.
    with op.batch_alter_table('documents') as batch_op:
        batch_op.alter_column('filename', server_default=None)
        batch_op.alter_column('file_type', server_default=None)
        batch_op.alter_column('storage_path', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('documents') as batch_op:
        batch_op.drop_column('storage_path')
        batch_op.drop_column('file_type')
        batch_op.drop_column('filename')
