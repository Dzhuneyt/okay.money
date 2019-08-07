##!/usr/bin/env sh

file="/host_tmp/is_leader"
if [ -f "$file" ]; then
  echo AWS BeanStalk environment update detected. Run migrations
else
  echo Not an AWS BeanStalk app. Running regular Apache
fi

apache2-foreground
