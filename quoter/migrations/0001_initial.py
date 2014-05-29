# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Author'
        db.create_table(u'quoter_author', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=128, blank=True)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=128, blank=True)),
            ('surname', self.gf('django.db.models.fields.CharField')(max_length=128, blank=True)),
        ))
        db.send_create_signal(u'quoter', ['Author'])

        # Adding model 'SourceMetadata'
        db.create_table(u'quoter_sourcemetadata', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=64)),
        ))
        db.send_create_signal(u'quoter', ['SourceMetadata'])

        # Adding model 'SourceInfos'
        db.create_table(u'quoter_sourceinfos', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('metadata', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['quoter.SourceMetadata'])),
            ('value', self.gf('django.db.models.fields.CharField')(max_length=64, blank=True)),
        ))
        db.send_create_signal(u'quoter', ['SourceInfos'])

        # Adding model 'Source'
        db.create_table(u'quoter_source', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=128)),
        ))
        db.send_create_signal(u'quoter', ['Source'])

        # Adding M2M table for field author on 'Source'
        m2m_table_name = db.shorten_name(u'quoter_source_author')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('source', models.ForeignKey(orm[u'quoter.source'], null=False)),
            ('author', models.ForeignKey(orm[u'quoter.author'], null=False))
        ))
        db.create_unique(m2m_table_name, ['source_id', 'author_id'])

        # Adding M2M table for field metadatas on 'Source'
        m2m_table_name = db.shorten_name(u'quoter_source_metadatas')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('source', models.ForeignKey(orm[u'quoter.source'], null=False)),
            ('sourceinfos', models.ForeignKey(orm[u'quoter.sourceinfos'], null=False))
        ))
        db.create_unique(m2m_table_name, ['source_id', 'sourceinfos_id'])

        # Adding model 'Tag'
        db.create_table(u'quoter_tag', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=64)),
        ))
        db.send_create_signal(u'quoter', ['Tag'])

        # Adding model 'Quote'
        db.create_table(u'quoter_quote', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['quoter.Source'], blank=True)),
            ('page', self.gf('django.db.models.fields.CharField')(max_length=32, blank=True)),
        ))
        db.send_create_signal(u'quoter', ['Quote'])

        # Adding M2M table for field authority on 'Quote'
        m2m_table_name = db.shorten_name(u'quoter_quote_authority')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('quote', models.ForeignKey(orm[u'quoter.quote'], null=False)),
            ('author', models.ForeignKey(orm[u'quoter.author'], null=False))
        ))
        db.create_unique(m2m_table_name, ['quote_id', 'author_id'])

        # Adding M2M table for field tags on 'Quote'
        m2m_table_name = db.shorten_name(u'quoter_quote_tags')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('quote', models.ForeignKey(orm[u'quoter.quote'], null=False)),
            ('tag', models.ForeignKey(orm[u'quoter.tag'], null=False))
        ))
        db.create_unique(m2m_table_name, ['quote_id', 'tag_id'])

        # Adding model 'Template'
        db.create_table(u'quoter_template', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=32, blank=True)),
        ))
        db.send_create_signal(u'quoter', ['Template'])

        # Adding M2M table for field expected_metadata on 'Template'
        m2m_table_name = db.shorten_name(u'quoter_template_expected_metadata')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('template', models.ForeignKey(orm[u'quoter.template'], null=False)),
            ('sourcemetadata', models.ForeignKey(orm[u'quoter.sourcemetadata'], null=False))
        ))
        db.create_unique(m2m_table_name, ['template_id', 'sourcemetadata_id'])


    def backwards(self, orm):
        # Deleting model 'Author'
        db.delete_table(u'quoter_author')

        # Deleting model 'SourceMetadata'
        db.delete_table(u'quoter_sourcemetadata')

        # Deleting model 'SourceInfos'
        db.delete_table(u'quoter_sourceinfos')

        # Deleting model 'Source'
        db.delete_table(u'quoter_source')

        # Removing M2M table for field author on 'Source'
        db.delete_table(db.shorten_name(u'quoter_source_author'))

        # Removing M2M table for field metadatas on 'Source'
        db.delete_table(db.shorten_name(u'quoter_source_metadatas'))

        # Deleting model 'Tag'
        db.delete_table(u'quoter_tag')

        # Deleting model 'Quote'
        db.delete_table(u'quoter_quote')

        # Removing M2M table for field authority on 'Quote'
        db.delete_table(db.shorten_name(u'quoter_quote_authority'))

        # Removing M2M table for field tags on 'Quote'
        db.delete_table(db.shorten_name(u'quoter_quote_tags'))

        # Deleting model 'Template'
        db.delete_table(u'quoter_template')

        # Removing M2M table for field expected_metadata on 'Template'
        db.delete_table(db.shorten_name(u'quoter_template_expected_metadata'))


    models = {
        u'quoter.author': {
            'Meta': {'object_name': 'Author'},
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'surname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'})
        },
        u'quoter.quote': {
            'Meta': {'object_name': 'Quote'},
            'authority': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['quoter.Author']", 'null': 'True', 'blank': 'True'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'page': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['quoter.Source']", 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['quoter.Tag']", 'null': 'True', 'blank': 'True'})
        },
        u'quoter.source': {
            'Meta': {'object_name': 'Source'},
            'author': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['quoter.Author']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadatas': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['quoter.SourceInfos']", 'symmetrical': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        u'quoter.sourceinfos': {
            'Meta': {'object_name': 'SourceInfos'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['quoter.SourceMetadata']"}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '64', 'blank': 'True'})
        },
        u'quoter.sourcemetadata': {
            'Meta': {'object_name': 'SourceMetadata'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64'})
        },
        u'quoter.tag': {
            'Meta': {'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64'})
        },
        u'quoter.template': {
            'Meta': {'object_name': 'Template'},
            'expected_metadata': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['quoter.SourceMetadata']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'})
        }
    }

    complete_apps = ['quoter']