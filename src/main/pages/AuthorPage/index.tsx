import { AuthorPage } from 'modules/authors/pages/Author';
import { authorsService } from 'modules/authors/services';
import { useParams } from 'react-router-dom';
import { useNavigationControl } from 'shared/navigation';

export default function WrappedAuthorPage() {
  const params = useParams();
  const authorId = params.id ? Number(params.id) : null;
  const navigationControl = useNavigationControl();

  return <AuthorPage authorId={authorId} navigationControl={navigationControl} authorsService={authorsService} />;
}
