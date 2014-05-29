# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Removing M2M table for field expected_metadata on 'Template'
        db.delete_table(db.shorten_name(u'quoter_template_expected_metadata'))

        # Adding M2M table for field expected_metadatas on 'Template'
        m2m_table_name = db.shorten_name(u'quoter_template_expected_metadatas')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('template', models.ForeignKey(orm[u'quoter.template'], null=False)),
            ('sourcemetadata', models.ForeignKey(orm[u'quoter.sourcemetadata'], null=False))
        ))
        db.create_unique(m2m_table_name, ['template_id', 'sourcemetadata_id'])

        # Removing M2M table for field author on 'Source'
        db.delete_table(db.shorten_name(u'quoter_source_author'))

        # Adding M2M table for field authors on 'Source'
        m2m_table_name = db.shorten_name(u'quoter_source_authors')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('source', models.ForeignKey(orm[u'quoter.source'], null=False)),
            ('author', models.ForeignKey(orm[u'quoter.author'], null=False))
        ))
        db.create_unique(m2m_table_name, ['source_id', 'author_id'])


    def backwards(self, orm):
        # Adding M2M table for field expected_metadata on 'Template'
        m2m_table_name = db.shorten_name(u'quoter_template_expected_metadata')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('template', models.ForeignKey(orm[u'quoter.template'], null=False)),
            ('sourcemetadata', models.ForeignKey(orm[u'quoter.sourcemetadata'], null=False))
        ))
        db.create_unique(m2m_table_name, ['template_id', 'sourcemetadata_id'])

        # Removing M2M table for field expected_metadatas on 'Template'
        db.delete_table(db.shorten_name(u'quoter_template_expected_metadatas'))

        # Adding M2M table for field author on 'Source'
        m2m_table_name = db.shorten_name(u'quoter_source_author')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('source', models.ForeignKey(orm[u'quoter.source'], null=False)),
            ('author', models.ForeignKey(orm[u'quoter.author'], null=False))
        ))
        db.create_unique(m2m_table_name, ['source_id', 'author_id'])

        # Removing M2M table for field authors on 'Source'
        db.delete_table(db.shorten_name(u'quoter_source_authors'))


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
            'authority': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['quoter.Author']", 'symmetrical': 'False'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'page': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['quoter.Source']", 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['quoter.Tag']", 'null': 'True', 'blank': 'True'})
        },
        u'quoter.source': {
            'Meta': {'object_name': 'Source'},
            'authors': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['quoter.Author']", 'symmetrical': 'False'}),
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
            'expected_metadatas': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['quoter.SourceMetadata']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'})
        }
    }

    complete_apps = ['quoter']