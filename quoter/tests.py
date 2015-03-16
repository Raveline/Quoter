from django.test import TestCase
from django.contrib.auth.models import User
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
        Author.objects.create(first_name="", last_name="", surname="Homer",
                              folder=self.folder)
        Author.objects.create(first_name="Henry", last_name="James", surname="",
                              folder=self.folder)

    def test_authors_display(self):
        homer = Author.objects.get(surname="Homer")
        henry_james = Author.objects.get(first_name="Henry", last_name="James")
        self.assertEqual(str(homer), "Homer")
        self.assertEqual(str(henry_james), "Henry James")

    def test_can_retrieve_pk(self):
        homer = Author.objects.get(surname="Homer")
        self.assertTrue(homer.pk > 0)


class TestSource(QuoterTests):
    def setUp(self):
        super(TestSource, self).setUp()
        Source.objects.create(title="Odyssey", folder=self.folder)

    def test_attach_author_to_source(self):
        """Attaching one author to the source works."""
        odyssey = Source.objects.get(title="Odyssey")
        homer = Author(first_name="", last_name="", surname="Homer",
                       folder=self.folder)
        homer.save()
        odyssey.authors.add(homer)
        self.assertEqual(str(odyssey), "Odyssey (HOMER)")
        self.assertEqual(odyssey.authors.count(), 1)

    def test_attach_authors_to_source(self):
        """Attaching many authors is recognized."""
        odyssey = Source.objects.get(title="Odyssey")
        homer = Author(first_name="", last_name="", surname="Homer",
                       folder=self.folder)
        virgil = Author(first_name="", last_name="", surname="Virgil",
                        folder=self.folder)
        homer.save()
        virgil.save()
        odyssey.authors.add(homer, virgil)
        self.assertEqual(str(odyssey), "Odyssey (HOMER ET AL.)")
        self.assertEqual(odyssey.authors.count(), 2)

    def test_detach_author_from_source(self):
        """Removing an author from a source doesn't delete the author from the
        database."""
        odyssey = Source.objects.get(title="Odyssey")
        homer = Author(first_name="", last_name="", surname="Homer",
                       folder=self.folder)
        homer.save()
        odyssey.authors.add(homer)
        odyssey.authors.remove(homer)
        self.assertEqual(str(odyssey), "Odyssey (ANONYMOUS)")
        self.assertEqual(odyssey.authors.count(), 0)
        reHomer = Author.objects.get(surname="Homer")
        self.assertEqual(reHomer, homer)

    def test_metadata(self):
        metaTrad = SourceMetadata(name="Traductor")
        metaTrad.save()
        metaInfo = SourceInfos(metadata=metaTrad, value="Thomas Hobbes")
        metaInfo.save()
        odyssey = Source.objects.get(title="Odyssey")
        odyssey.metadatas.add(metaInfo)
        self.assertEqual(odyssey.metadatas.count(), 1)

    def test_add_source(self):
        henryTest = Author(first_name="Henry", last_name="Test", surname="",
                           folder=self.folder)
        henryTest.save()
        logsuc = self.client.login(username='test', password='test')
        self.assertTrue(logsuc)
        response = self.client.post('/source/new/',
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
        response = self.client.post('/source/new/',
                                    {'title': 'A test source',
                                     'authors': henryTest.pk,
                                     'metadatas': '{"editeur":"Flammarion", "Collection":"collec"}'
                           })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SourceMetadata.objects.filter(
            name__icontains="editeur"
        ).count(), 1)
