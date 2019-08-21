#!/usr/bin/env sh

maxcounter=45

counter=1
while ! mysql --protocol TCP -h "${MYSQL_HOST}" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "show databases;" > /dev/null 2>&1; do
    echo MySQL connection failed. Sleeping...
    sleep 2
    counter=`expr $counter + 1`
    if [ $counter -gt $maxcounter ]; then
        >&2 echo "We have been waiting for MySQL too long already; failing."
        exit 1
    fi;
done
