package no.nav.data.common.dgs;

import com.netflix.graphql.dgs.DgsScalar;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@DgsScalar(name = "Date")
public class DateScalar implements Coercing<LocalDate, String> {

    @Override
    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
        if (dataFetcherResult instanceof LocalDate) {
            return ((LocalDate) dataFetcherResult).format(DateTimeFormatter.ISO_DATE);
        } else {
            throw new CoercingSerializeException("Not a valid Date");
        }
    }

    @Override
    public LocalDate parseValue(Object input) throws CoercingParseValueException {
        return LocalDate.parse(input.toString(), DateTimeFormatter.ISO_DATE);
    }

    @Override
    public LocalDate parseLiteral(Object input) throws CoercingParseLiteralException {
        if (input instanceof StringValue) {
            return LocalDate.parse(((StringValue) input).getValue(), DateTimeFormatter.ISO_DATE);
        }

        throw new CoercingParseLiteralException("Value is not a valid ISO date time");
    }
}
