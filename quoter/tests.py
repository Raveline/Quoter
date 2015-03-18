from django.test import TestCase
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from quoter.views import addSource
from quoter.models import Author, Source, SourceMetadata, SourceInfos, Folder


class QuoterTests(TestCase):
    def setUp(self):
        self.test_user = User.objects.create(username='test')
        self.test_user.set_password('test')
        self.folder = Folder.objects.create(name="test", user=self.test_user)
        self.test_user.save()
        self.folder.save()


class AuthorTest(QuoterTests):
    def setUp(self):
        super(AuthorTest, self).setUp()
        self.homer = Author.objects.create(
            surname="Homer", folder=self.folder
        )
        self.james = Author.objects.create(
            first_name="Henry", last_name="James", folder=self.folder
        )

    def test_authors_display(self):
        self.assertEqual(str(self.homer), "Homer")
        self.assertEqual(str(self.james), "Henry James")

    def test_to_dict(self):
        self.assertEqual(self.homer.to_dict(), {'first_name': '',
                                                'last_name': '',
                                                'surname': 'Homer'})
        self.assertEqual(self.james.to_dict(), {'first_name': 'Henry',
                                                'last_name': 'James',
                                                'surname': ''})


class TestSource(QuoterTests):
    def setUp(self):
        super(TestSource, self).setUp()
        self.odyssey = Source.objects.create(title="Odyssey",
                                             folder=self.folder)

    def test_to_dict(self):
        homer = Author(surname="Homer", folder=self.folder)
        homer.save()
        metaTrad = SourceMetadata(name="Traductor")
        metaTrad.save()
        metaInfo = SourceInfos(metadata=metaTrad, value="Thomas Hobbes")
        metaInfo.save()
        self.odyssey.authors.add(homer)
        self.odyssey.metadatas.add(metaInfo)
        self.assertEqual(self.odyssey.to_dict(),
                         {'title': 'Odyssey', 'authors': [homer.pk],
                          'metadata': [{metaTrad.name: metaInfo.value}]})

    def test_attach_author_to_source(self):
        """Attaching one author to the source works."""
        homer = Author(surname="Homer", folder=self.folder)
        homer.save()
        self.odyssey.authors.add(homer)
        self.assertEqual(str(self.odyssey), "Odyssey (HOMER)")
        self.assertEqual(self.odyssey.authors.count(), 1)

    def test_attach_authors_to_source(self):
        """Attaching many authors is recognized."""
        homer = Author(surname="Homer", folder=self.folder)
        virgil = Author(surname="Virgil", folder=self.folder)
        homer.save()
        virgil.save()
        self.odyssey.authors.add(homer, virgil)
        self.assertEqual(str(self.odyssey), "Odyssey (HOMER ET AL.)")
        self.assertEqual(self.odyssey.authors.count(), 2)

    def test_detach_author_from_source(self):
        """Removing an author from a source doesn't delete the author from the
        database."""
        homer = Author(surname="Homer", folder=self.folder)
        homer.save()
        self.odyssey.authors.add(homer)
        self.odyssey.authors.remove(homer)
        self.assertEqual(str(self.odyssey), "Odyssey (ANONYMOUS)")
        self.assertEqual(self.odyssey.authors.count(), 0)
        reHomer = Author.objects.get(surname="Homer")
        self.assertEqual(reHomer, homer)

    def test_metadata(self):
        metaTrad = SourceMetadata(name="Traductor")
        metaTrad.save()
        metaInfo = SourceInfos(metadata=metaTrad, value="Thomas Hobbes")
        metaInfo.save()
        self.odyssey.metadatas.add(metaInfo)
        self.assertEqual(self.odyssey.metadatas.count(), 1)

    def test_add_source(self):
        henryTest = Author(first_name="Henry", last_name="Test", surname="",
                           folder=self.folder)
        henryTest.save()
        logsuc = self.client.login(username='test', password='test')
        self.assertTrue(logsuc)
        response = self.client.post(reverse(addSource),
                                    {'title': 'A test source',
                                     'authors': henryTest.pk,
                                     'metadatas': '{"Editeur": "Flammarion", "Collection": "collec"}'})
        self.assertEqual(response.status_code, 200)

    def test_not_colliding_metadatas(self):
        henryTest = Author(first_name="Henry", last_name="Test", surname="",
                           folder=self.folder)
        henryTest.save()
        metadata = SourceMetadata(name='Editeur')
        metadata.save()
        # Metadata entered with initial lowercase ("editeur")
        # should be recognized as the uppercase initial ("Editeur")
        self.client.login(username='test', password='test')
        response = self.client.post(reverse(addSource),
                                    {'title': 'A test source',
                                     'authors': henryTest.pk,
                                     'metadatas': '{"editeur":"Flammarion", "Collection":"collec"}'
                                     })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SourceMetadata.objects.filter(
            name__icontains="editeur"
        ).count(), 1)
