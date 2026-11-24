FROM maven:3.9.11-eclipse-temurin-25 AS build

WORKDIR /app

RUN mkdir -p /root/.m2 && \
    printf '%s\n' \
    '<settings><mirrors><mirror><id>google-central</id><mirrorOf>central</mirrorOf><url>https://maven-central.storage-download.googleapis.com/maven2/</url></mirror></mirrors></settings>' \
    > /root/.m2/settings.xml

COPY pom.xml .
COPY src ./src

RUN mvn -B -s /root/.m2/settings.xml clean package -DskipTests

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
