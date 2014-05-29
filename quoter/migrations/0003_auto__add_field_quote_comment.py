# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Quote.comment'
        db.add_column(u'quoter_quote', 'comment',
                      self.gf('django.db.models.fields.TextField')(default=''),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Quote.comment'
        db.delete_column(u'quoter_quote', 'comment')


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
            'comment': ('django.db.models.fields.TextField', [], {'default': "''"}),
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