---
title: Tags
type: tags
# All the Tags of posts.
# v2.0
# https://github.com/cotes2020/jekyll-theme-chirpy
# © 2017-2019 Cotes Chung
# MIT License
---

{% comment %}
  'site.tags' looks like a Map, e.g. site.tags.MyTag.[ Post0, Post1, ... ]
  Print the {{ site.tags }} will help you to understand it.
{% endcomment %}
<div id="tags" class="d-flex flex-wrap ml-xl-2 mr-xl-2">
{% assign tags = "" | split: "" %}
{% for t in site.tags %}
  {% assign tags = tags | push: t[0] %}
{% endfor %}

{% assign sorted_tags = tags | sort_natural %}

{% for t in sorted_tags %}
  <div>
    <a class="tag" href="{{ site.baseurl }}/tags/{{ t | replace: ' ', '-' | downcase | url_encode }}/">{{ t }}<span class="text-muted">{{ site.tags[t].size }}</span></a>
  </div>
{% endfor %}

</div>

<script data-name="BMC-Widget" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="oxybro" data-description="Support me on Buy me a coffee!" data-message="Thank you for visiting. You can now buy me a coffee!" data-color="#64ffda" data-position="" data-x_margin="18" data-y_margin="18"></script>