# Generated by Django 3.0.8 on 2020-08-16 14:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0015_auto_20200816_2011'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='listing_category',
            field=models.CharField(blank=True, choices=[('', '---------'), ('FN', 'Fashion'), ('TY', 'Toys'), ('AT', 'Antique'), ('CS', 'Computers'), ('AC', 'Accessories'), ('PC', 'Personal Care'), ('HD', 'Home Decor')], default='CS', max_length=2),
        ),
    ]